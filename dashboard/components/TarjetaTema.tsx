'use client';

import { useRef, useState } from 'react';
import type { Tema, TemaId } from '@/lib/tipos';
import { COLOR_TEMA, IMAGEN_TEMA, resaltar } from '@/lib/fintech';
import { NOMBRE_NIVEL, NOMBRE_TEMA } from '@/lib/vista';
import Texto from './Texto';

const ESTADO_TXT = { atrasada: 'ATRASADA', pareja: 'PAREJA', adelantada: 'ADELANTADA' } as const;

/** Tarjeta de crédito de un tema: frente con nivel de Argentina, dorso con el resumen. */
export default function TarjetaTema({
  tema, datos, nivelAR, indice, hayTendencias, onVerTendencias,
}: {
  tema: TemaId;
  datos?: Tema;
  nivelAR: number | null;
  indice: number;
  hayTendencias: boolean;
  onVerTendencias: () => void;
}) {
  const [vuelta, setVuelta] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const frente = useRef<HTMLButtonElement>(null);
  const color = COLOR_TEMA[tema];
  const estado = datos?.estado_global ?? null;

  const mover = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const salir = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  const volver = () => {
    setVuelta(false);
    requestAnimationFrame(() => frente.current?.focus());
  };

  return (
    <div
      ref={ref}
      className={`tarjeta-cc${vuelta ? ' es-vuelta' : ''}`}
      style={{ '--c': color } as React.CSSProperties}
      onPointerMove={mover}
      onPointerLeave={salir}
      onKeyDown={(e) => { if (e.key === 'Escape' && vuelta) { e.stopPropagation(); volver(); } }}
    >
      <div className="tarjeta-cc__giro">
        <button
          ref={frente}
          type="button"
          className="tarjeta-cc__cara tarjeta-cc__frente"
          onClick={() => setVuelta(true)}
          aria-label={`${NOMBRE_TEMA[tema]}: ver resumen`}
          aria-hidden={vuelta}
          tabIndex={vuelta ? -1 : 0}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tarjeta-cc__arte" src={IMAGEN_TEMA[tema]} alt="" draggable={false} />
          <span className="tarjeta-cc__velo" aria-hidden="true" />
          <span className="tarjeta-cc__holo" aria-hidden="true" />
          <span className="tarjeta-cc__arriba">
            <span className="tarjeta-cc__marca">FINN · {String(indice + 1).padStart(2, '0')}</span>
            <span className="tarjeta-cc__sin-contacto" aria-hidden="true">)))</span>
          </span>
          <span className="tarjeta-cc__chip" aria-hidden="true" />
          <span className="tarjeta-cc__numero">
            {nivelAR === null ? 'NIVEL S/D' : `NIVEL ${nivelAR}/3`}
            <small>{nivelAR === null ? 'sin datos' : NOMBRE_NIVEL[nivelAR]}</small>
          </span>
          <span className="tarjeta-cc__abajo">
            <span className="tarjeta-cc__titular">{NOMBRE_TEMA[tema]}</span>
            <span className="tarjeta-cc__vence">
              <small>VS MUNDO</small>
              <b className={`res res--${estado ?? 'nula'}`}>{estado ? ESTADO_TXT[estado] : 'S/D'}</b>
            </span>
          </span>
        </button>

        <div
          className="tarjeta-cc__cara tarjeta-cc__dorso"
          aria-hidden={!vuelta}
          onClick={(e) => { if (e.target === e.currentTarget) volver(); }}
        >
          <span className="tarjeta-cc__banda" aria-hidden="true" />
          <div className="tarjeta-cc__dorso-cuerpo">
            <p className="tarjeta-cc__resumen">
              {datos ? <Texto trozos={resaltar(datos.resumen)} /> : 'Sin resumen en esta edición.'}
            </p>
            {datos?.proveedores && <p className="tarjeta-cc__dato"><span>Quiénes</span> {datos.proveedores}</p>}
          </div>
          <div className="tarjeta-cc__acciones">
            <button type="button" className="boton-mini" onClick={volver} tabIndex={vuelta ? 0 : -1}>↺ Frente</button>
            <button
              type="button"
              className="boton-mini boton-mini--color"
              onClick={onVerTendencias}
              disabled={!hayTendencias}
              tabIndex={vuelta ? 0 : -1}
            >
              {hayTendencias ? 'Ver tendencias del tema →' : 'Sin tendencias en este horizonte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
