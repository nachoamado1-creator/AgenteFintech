'use client';

import { useEffect, useRef, useState } from 'react';

const MARGEN = 6;

/**
 * Barra de scroll de Finn: una barra de carga fina, como la de un pago en proceso.
 * Se llena con el scroll mostrando el % y el estado; al llegar al final queda "Aprobado".
 */
export default function BarraScroll() {
  const riel = useRef<HTMLDivElement>(null);
  const relleno = useRef<HTMLDivElement>(null);
  const cabeza = useRef<HTMLDivElement>(null);
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
      const alto = Math.max(0, (riel.current?.clientHeight ?? 0) - MARGEN * 2);
      if (relleno.current) relleno.current.style.transform = `scaleY(${p})`;
      if (cabeza.current) cabeza.current.style.transform = `translateY(${p * alto}px)`;
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
    const util = Math.max(1, caja.height - MARGEN * 2);
    const p = Math.min(1, Math.max(0, (clientY - caja.top - MARGEN) / util));
    const el = document.documentElement;
    window.scrollTo({ top: p * (el.scrollHeight - el.clientHeight), behavior: 'instant' });
  };

  const aprobado = pct >= 99;

  return (
    <div className="barra-scroll" data-visible={hayScroll} data-arrastre={arrastrando} data-aprobado={aprobado} aria-hidden="true">
      <div
        ref={riel}
        className="barra-scroll__riel"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastrando(true); irA(e.clientY); }}
        onPointerMove={(e) => { if (arrastrando) irA(e.clientY); }}
        onPointerUp={() => setArrastrando(false)}
        onPointerCancel={() => setArrastrando(false)}
      >
        <div className="barra-scroll__pista">
          <div ref={relleno} className="barra-scroll__relleno" />
        </div>
        <div ref={cabeza} className="barra-scroll__cabeza">
          <span className="barra-scroll__punta" />
          <span className="barra-scroll__estado">
            {aprobado ? (
              <>
                <svg viewBox="0 0 16 16" className="barra-scroll__check"><path d="M3.5 8.5l3 3 6-7" /></svg>
                Aprobado
              </>
            ) : (
              <>{pct}% · Procesando…</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
