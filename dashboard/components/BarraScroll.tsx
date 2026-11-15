'use client';

import { useEffect, useRef, useState } from 'react';

const FICHA = 34;

/**
 * Barra de scroll de Finn: un riel con marcas de escala, como el eje de una cotización,
 * y una ficha con la F que se desliza por él mostrando el % de página recorrido.
 */
export default function BarraScroll() {
  const riel = useRef<HTMLDivElement>(null);
  const ficha = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [hayScroll, setHayScroll] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setHayScroll(max > 8);
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const alto = riel.current?.clientHeight ?? 0;
      if (ficha.current) ficha.current.style.transform = `translateY(${p * Math.max(0, alto - FICHA)}px)`;
      setPct(Math.round(p * 100));
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    const obs = new ResizeObserver(pedir);
    obs.observe(document.body);
    return () => {
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const irA = (clientY: number) => {
    const r = riel.current;
    if (!r) return;
    const caja = r.getBoundingClientRect();
    const util = Math.max(1, caja.height - FICHA);
    const p = Math.min(1, Math.max(0, (clientY - caja.top - FICHA / 2) / util));
    const el = document.documentElement;
    window.scrollTo({ top: p * (el.scrollHeight - el.clientHeight), behavior: 'instant' });
  };

  return (
    <div className="barra-scroll" data-visible={hayScroll} data-arrastre={arrastrando} aria-hidden="true">
      <div
        ref={riel}
        className="barra-scroll__riel"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastrando(true); irA(e.clientY); }}
        onPointerMove={(e) => { if (arrastrando) irA(e.clientY); }}
        onPointerUp={() => setArrastrando(false)}
        onPointerCancel={() => setArrastrando(false)}
      >
        <div ref={ficha} className="barra-scroll__ficha">
          <span className="barra-scroll__pct">{pct}%</span>
          <svg viewBox="0 0 64 64" className="barra-scroll__moneda">
            <circle cx="32" cy="32" r="29" className="barra-scroll__disco" />
            <path
              d="M18.5 17.9a1.2 1.2 0 0 1 1.2-1.2h24.2a1.2 1.2 0 0 1 1.2 1.2v5.4a1.2 1.2 0 0 1-1.2 1.2H27.9v5.2h9.1a1.2 1.2 0 0 1 1.2 1.2v5.1a1.2 1.2 0 0 1-1.2 1.2h-9.1v10.3a1.2 1.2 0 0 1-1.2 1.2h-7a1.2 1.2 0 0 1-1.2-1.2Z"
              fill="#fff"
            />
            <circle cx="43.5" cy="45" r="4.2" fill="#d2ccfb" />
          </svg>
        </div>
      </div>
    </div>
  );
}
