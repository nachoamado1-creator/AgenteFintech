'use client';

import { useEffect, useRef } from 'react';

/** Fondo de red de nodos (blockchain) que se mueven despacio y se unen cuando están cerca. */
export default function Nodos() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ancho = 0, alto = 0, raf = 0, visible = false;
    let nodos: { x: number; y: number; vx: number; vy: number }[] = [];

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = canvas.clientWidth; alto = canvas.clientHeight;
      canvas.width = ancho * dpr; canvas.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((ancho * alto) / 26000);
      nodos = Array.from({ length: n }, () => ({
        x: Math.random() * ancho, y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const dibujar = () => {
      ctx.clearRect(0, 0, ancho, alto);
      for (const n of nodos) {
        if (!reducir) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > ancho) n.vx *= -1;
          if (n.y < 0 || n.y > alto) n.vy *= -1;
        }
      }
      for (let i = 0; i < nodos.length; i++) {
        for (let j = i + 1; j < nodos.length; j++) {
          const a = nodos[i], b = nodos[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) {
            ctx.strokeStyle = `rgba(124, 140, 255, ${0.16 * (1 - d / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodos) {
        ctx.fillStyle = 'rgba(166, 139, 255, 0.5)';
        ctx.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
      }
      if (!reducir && visible) raf = requestAnimationFrame(dibujar);
    };

    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(dibujar);
    });
    medir();
    dibujar();
    obs.observe(canvas);
    const alCambiar = () => { medir(); dibujar(); };
    window.addEventListener('resize', alCambiar);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); window.removeEventListener('resize', alCambiar); };
  }, []);

  return <canvas ref={ref} className="fondo-nodos" aria-hidden="true" />;
}
