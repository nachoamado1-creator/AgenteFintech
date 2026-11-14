'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVOS = 'a, button, [role="button"], [data-cursor="hover"]';

/**
 * Cursor propio: un punto blanco que sigue al puntero sin retraso.
 * La posición se escribe directo en el estilo (sin transición); solo el tamaño se anima.
 * En pantallas táctiles no se muestra y queda el cursor normal.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ref.current;
    if (!el) return;
    document.documentElement.classList.add('cursor-propio');

    const mover = (e: PointerEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.dataset.visible = 'true';
      el.dataset.hover = (e.target as Element | null)?.closest?.(INTERACTIVOS) ? 'true' : 'false';
    };
    const salir = () => { el.dataset.visible = 'false'; };
    const bajar = () => { el.dataset.presionado = 'true'; };
    const subir = () => { el.dataset.presionado = 'false'; };

    window.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerleave', salir);
    window.addEventListener('pointerdown', bajar);
    window.addEventListener('pointerup', subir);
    return () => {
      document.documentElement.classList.remove('cursor-propio');
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerleave', salir);
      window.removeEventListener('pointerdown', bajar);
      window.removeEventListener('pointerup', subir);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true" data-visible="false">
      <span className="cursor__punto" />
    </div>
  );
}
