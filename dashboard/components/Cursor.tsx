'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor de mira: un punto que sigue al mouse y un visor de esquinas que lo
 * alcanza con retraso. Sobre algo clicable el visor se agranda.
 * Solo con mouse (no en pantallas táctiles).
 */
export default function Cursor() {
  const punto = useRef<HTMLDivElement>(null);
  const visor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('con-cursor');
    let x = -100, y = -100, vx = -100, vy = -100, raf = 0;

    const mover = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const sobre = (e.target as Element | null)?.closest('a, button, select, [role="button"], [role="radio"], label');
      visor.current?.classList.toggle('es-sobre', !!sobre);
      document.documentElement.classList.remove('cursor-fuera');
    };
    const bajar = () => visor.current?.classList.add('es-click');
    const subir = () => visor.current?.classList.remove('es-click');
    const fuera = () => document.documentElement.classList.add('cursor-fuera');

    const cuadro = () => {
      vx += (x - vx) * (reducir ? 1 : 0.2);
      vy += (y - vy) * (reducir ? 1 : 0.2);
      if (punto.current) punto.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (visor.current) visor.current.style.transform = `translate3d(${vx}px, ${vy}px, 0)`;
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    window.addEventListener('pointermove', mover, { passive: true });
    window.addEventListener('pointerdown', bajar);
    window.addEventListener('pointerup', subir);
    document.addEventListener('pointerleave', fuera);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerdown', bajar);
      window.removeEventListener('pointerup', subir);
      document.removeEventListener('pointerleave', fuera);
      document.documentElement.classList.remove('con-cursor');
    };
  }, []);

  return (
    <>
      <div ref={visor} className="cursor-visor" aria-hidden="true"><i /><i /><i /><i /></div>
      <div ref={punto} className="cursor-punto" aria-hidden="true" />
    </>
  );
}
