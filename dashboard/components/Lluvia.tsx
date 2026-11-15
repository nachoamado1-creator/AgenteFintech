'use client';

import { useEffect, useRef } from 'react';

const SIMBOLOS = ['$', '₿', '₮', 'ARS', 'USD', 'PIX', 'QR', 'API', 'IA', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '%', '↑', '↓'];
const COLORES = ['#5EB8FF', '#7C8CFF', '#A68BFF', '#D38BFF', '#3D6BFF'];

/** Lluvia de caracteres fintech en un canvas detrás de la portada. */
export default function Lluvia() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const paso = 22;
    let ancho = 0, alto = 0, cols: { y: number; v: number; c: string }[] = [];
    let raf = 0;
    let factor = 1;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = canvas.clientWidth;
      alto = canvas.clientHeight;
      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.ceil(ancho / paso) }, () => ({
        y: Math.random() * -alto,
        v: 0.4 + Math.random() * 0.9,
        c: COLORES[Math.floor(Math.random() * COLORES.length)],
      }));
    };

    const onScroll = () => {
      factor = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.9));
      canvas.style.opacity = String(0.2 + factor * 0.8);
    };

    let cuadro = 0;
    const dibujar = () => {
      raf = requestAnimationFrame(dibujar);
      onScroll();
      // Más lento al salir de la portada: se saltean cuadros.
      cuadro++;
      if (factor < 0.5 && cuadro % 3) return;
      ctx.fillStyle = 'rgba(7, 7, 10, 0.12)';
      ctx.fillRect(0, 0, ancho, alto);
      ctx.font = '600 13px ui-monospace, monospace';
      ctx.globalAlpha = 0.8;
      cols.forEach((col, i) => {
        ctx.fillStyle = col.c;
        ctx.fillText(SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)], i * paso, col.y);
        col.y += col.v * 2.2;
        if (col.y > alto + 40) {
          col.y = Math.random() * -200;
          col.v = 0.4 + Math.random() * 0.9;
        }
      });
      ctx.globalAlpha = 1;
    };

    medir();
    raf = requestAnimationFrame(dibujar);
    window.addEventListener('resize', medir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', medir);
    };
  }, []);

  return <canvas ref={ref} className="lluvia" aria-hidden="true" />;
}
