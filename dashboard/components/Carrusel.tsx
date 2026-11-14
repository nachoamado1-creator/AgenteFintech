'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tendencia } from '@/lib/tipos';
import { NOMBRE_CAPACIDAD, NOMBRE_TEMA, claveTendencia } from '@/lib/vista';

/** Fila de tendencias deslizable: con flechas, con la rueda o el dedo, y arrastrando con el mouse. */
export default function Carrusel({
  lista, activa, onAbrir,
}: {
  lista: Tendencia[];
  activa: string | null;
  onAbrir: (t: Tendencia) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: true });
  const arrastre = useRef({ x: 0, izquierda: 0, activo: false, movido: false });

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft <= 2, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = 0;
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lista, medir]);

  const mover = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const bajar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    arrastre.current = { x: e.clientX, izquierda: ref.current.scrollLeft, activo: true, movido: false };
  };
  const moverPuntero = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    const el = ref.current;
    if (!a.activo || !el) return;
    const dx = e.clientX - a.x;
    if (!a.movido && Math.abs(dx) > 5) {
      a.movido = true;
      el.dataset.arrastrando = 'true';
      el.setPointerCapture(e.pointerId);
    }
    if (a.movido) el.scrollLeft = a.izquierda - dx;
  };
  const soltar = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    arrastre.current.activo = false;
    if (el) {
      el.dataset.arrastrando = 'false';
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
  };
  /** Un arrastre no debe abrir la tarjeta sobre la que se soltó el mouse. */
  const frenarClick = (e: React.MouseEvent) => {
    if (arrastre.current.movido) {
      e.preventDefault();
      e.stopPropagation();
      arrastre.current.movido = false;
    }
  };

  if (!lista.length) {
    return <p className="vacio">No hay tendencias en este horizonte.</p>;
  }

  const hayMas = !(bordes.inicio && bordes.fin);

  return (
    <div className="carrusel">
      <div
        ref={ref}
        className="carrusel__pista"
        onScroll={medir}
        onPointerDown={bajar}
        onPointerMove={moverPuntero}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onClickCapture={frenarClick}
      >
        {lista.map((t, n) => {
          const clave = claveTendencia(t);
          return (
            <button
              key={clave}
              type="button"
              className="tarjeta-tendencia"
              data-activa={activa === clave}
              aria-pressed={activa === clave}
              onClick={() => onAbrir(t)}
              style={{ '--d': `${n * 45}ms` } as React.CSSProperties}
            >
              <span className="tarjeta-tendencia__cabeza">
                <span className="tarjeta-tendencia__tema">{NOMBRE_TEMA[t.tema]}</span>
                <span className="tarjeta-tendencia__numero">{String(n + 1).padStart(2, '0')}</span>
              </span>
              <span className="tarjeta-tendencia__nombre">{t.nombre}</span>
              <span className="tarjeta-tendencia__pie">
                <span className="pildora">{NOMBRE_CAPACIDAD[t.capacidad]}</span>
                <span className="texto-3">{t.fuentes.length} {t.fuentes.length === 1 ? 'fuente' : 'fuentes'}</span>
              </span>
            </button>
          );
        })}
      </div>
      {hayMas && (
        <div className="carrusel__flechas">
          <button type="button" className="flecha" onClick={() => mover(-1)} disabled={bordes.inicio} aria-label="Ver tendencias anteriores">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" className="flecha" onClick={() => mover(1)} disabled={bordes.fin} aria-label="Ver más tendencias">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
