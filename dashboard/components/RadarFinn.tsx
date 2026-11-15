'use client';

import { useMemo, useState } from 'react';
import type { Tendencia } from '@/lib/tipos';
import { COLOR_TEMA } from '@/lib/fintech';
import { BORDE_HORIZONTE, HORIZONTES, NOMBRE_TEMA, TEMAS, puntosRadar } from '@/lib/vista';

const C = 200;
/** Esquina de cada cuadrante, en el orden de TEMAS (reloj desde arriba a la derecha). */
const ESQUINAS = [
  { x: 398, y: 22, ancla: 'end' },
  { x: 398, y: 392, ancla: 'end' },
  { x: 2, y: 392, ancla: 'start' },
  { x: 2, y: 22, ancla: 'start' },
] as const;

const polar = (angulo: number, radio: number) => {
  const rad = (angulo * Math.PI) / 180;
  return { x: Math.round((C + radio * Math.sin(rad)) * 100) / 100, y: Math.round((C - radio * Math.cos(rad)) * 100) / 100 };
};
const sector = (desde: number, hasta: number, radio: number) => {
  const a = polar(desde, radio);
  const b = polar(hasta, radio);
  return `M ${C} ${C} L ${a.x} ${a.y} A ${radio} ${radio} 0 0 1 ${b.x} ${b.y} Z`;
};

/**
 * Radar de tendencias: el centro es Argentina hoy, cada anillo un horizonte y cada
 * cuadrante un tema. Los puntos del horizonte elegido se encienden y se pueden tocar.
 */
export default function RadarFinn({
  tendencias, onAbrir,
}: {
  tendencias: Tendencia[];
  onAbrir: (t: Tendencia, el: Element) => void;
}) {
  const puntos = useMemo(() => puntosRadar(tendencias, C, C), [tendencias]);
  const [sobre, setSobre] = useState<string | null>(null);
  const senalado = puntos.find((p) => p.clave === sobre);

  return (
    <figure className="radar" aria-label="Radar de tendencias">
      <svg viewBox="0 0 400 400" className="radar__svg">
        <defs>
          <radialGradient id="radar-fondo">
            <stop offset="0" stopColor="#5b6cff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#5b6cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="radar-barrido" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#8f7bff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8f7bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={BORDE_HORIZONTE.largo + 6} className="radar__disco" />
        <circle cx={C} cy={C} r={BORDE_HORIZONTE.largo} fill="url(#radar-fondo)" />
        {TEMAS.map((t, i) => (
          <path key={t} d={sector(i * 90, (i + 1) * 90, BORDE_HORIZONTE.largo)} fill={COLOR_TEMA[t]} className="radar__cuadrante" />
        ))}
        {HORIZONTES.map((h) => (
          <circle
            key={h.id}
            cx={C}
            cy={C}
            r={BORDE_HORIZONTE[h.id]}
            className="radar__anillo"
            data-activo="true"
          />
        ))}
        <path d={`M${C} ${C - 172}V${C + 172}M${C - 172} ${C}H${C + 172}`} className="radar__eje" />
        <g className="radar__barrido">
          <path d={`M${C} ${C} L${C} ${C - 172} A172 172 0 0 1 ${C + 121.6} ${C - 121.6} Z`} fill="url(#radar-barrido)" />
        </g>
        {HORIZONTES.map((h) => (
          <text key={h.id} x={C + 6} y={C - BORDE_HORIZONTE[h.id] + 12} className="radar__franja" data-activo="true">
            {h.largo.toUpperCase()}
          </text>
        ))}
        {TEMAS.map((t, i) => {
          const nombre = NOMBRE_TEMA[t].toUpperCase();
          const ancho = nombre.length * 6.6 + 22;
          const e = ESQUINAS[i];
          const x0 = e.ancla === 'end' ? e.x - ancho : e.x;
          return (
            <g key={t} className="radar__etiqueta" style={{ '--c': COLOR_TEMA[t] } as React.CSSProperties}>
              <rect x={x0} y={e.y - 13} width={ancho} height={19} rx={9.5} />
              <circle cx={x0 + 10} cy={e.y - 3.5} r={3} />
              <text x={x0 + 17} y={e.y}>{nombre}</text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r="4" className="radar__centro" />
        <text x={C} y={C + 18} textAnchor="middle" className="radar__hoy">AR · HOY</text>

        {puntos.map((p) => {
          return (
            <g
              key={p.clave}
              className="radar__punto"
              data-activo="true"
              style={{ '--c': COLOR_TEMA[p.tendencia.tema] } as React.CSSProperties}
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={p.tendencia.nombre}
              onMouseEnter={() => setSobre(p.clave)}
              onMouseLeave={() => setSobre(null)}
              onFocus={() => setSobre(p.clave)}
              onBlur={() => setSobre(null)}
              onClick={(e) => onAbrir(p.tendencia, e.currentTarget)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrir(p.tendencia, e.currentTarget); } }}
            >
              <circle r={p.tam + 6} className="radar__halo" />
              <circle r={p.tam} className="radar__nucleo" />
            </g>
          );
        })}
      </svg>
      <figcaption className="radar__leyenda" aria-live="polite">
        {senalado && <><b style={{ color: COLOR_TEMA[senalado.tendencia.tema] }}>●</b> {senalado.tendencia.nombre}</>}
      </figcaption>
    </figure>
  );
}
