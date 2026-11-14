'use client';

import { useMemo, useState } from 'react';
import type { Horizonte, TemaId, Tendencia } from '@/lib/tipos';
import { BORDE_HORIZONTE, HORIZONTES, NOMBRE_TEMA, NOMBRE_TEMA_CORTO, TEMAS, puntosRadar } from '@/lib/vista';

const C = 200;
const R = BORDE_HORIZONTE.largo;
/** Segundos que tarda el barrido en dar una vuelta (igual que en globals.css). */
const VUELTA = 12;

const polar = (angulo: number, radio: number) => {
  const rad = (angulo * Math.PI) / 180;
  return { x: Math.round((C + radio * Math.sin(rad)) * 100) / 100, y: Math.round((C - radio * Math.cos(rad)) * 100) / 100 };
};

const sector = (desde: number, hasta: number, radio: number) => {
  const a = polar(desde, radio);
  const b = polar(hasta, radio);
  return `M ${C} ${C} L ${a.x} ${a.y} A ${radio} ${radio} 0 0 1 ${b.x} ${b.y} Z`;
};

/** Esquina de cada cuadrante, en el orden de TEMAS (reloj desde arriba a la derecha). */
const ESQUINAS = [
  { x: 396, y: 16, ancla: 'end' },
  { x: 396, y: 394, ancla: 'end' },
  { x: 4, y: 394, ancla: 'start' },
  { x: 4, y: 16, ancla: 'start' },
] as const;

/**
 * Radar de tendencias: el centro es Argentina hoy, cada franja es un horizonte
 * y cada cuadrante un tema. Solo se pueden tocar los puntos del horizonte elegido.
 */
export default function MapaRadar({
  tendencias, horizonte, tema, activa, onTema, onTendencia,
}: {
  tendencias: Tendencia[];
  horizonte: Horizonte;
  tema: TemaId;
  activa: string | null;
  onTema: (t: TemaId) => void;
  onTendencia: (t: Tendencia) => void;
}) {
  const puntos = useMemo(() => puntosRadar(tendencias, C, C), [tendencias]);
  const [sobre, setSobre] = useState<string | null>(null);

  const hz = HORIZONTES.find((h) => h.id === horizonte)!;
  const visibles = puntos.filter((p) => p.tendencia.horizonte_ar === horizonte);
  const senalado = puntos.find((p) => p.clave === sobre) ?? visibles.find((p) => p.clave === activa) ?? null;

  return (
    <div className="mapa">
      <svg className="mapa__svg" viewBox="0 0 400 400" role="group" aria-label={`Radar de tendencias, ${hz.etiqueta}`}>
        <defs>
          <radialGradient id="mapa-tema" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {TEMAS.map((t, i) => (
          <path
            key={t}
            d={sector(i * 90, (i + 1) * 90, R)}
            className="mapa__cuadrante"
            data-activo={t === tema}
            onClick={() => onTema(t)}
            aria-hidden="true"
          />
        ))}

        {HORIZONTES.map((h) => (
          <circle key={h.id} cx={C} cy={C} r={BORDE_HORIZONTE[h.id]} className="mapa__anillo" data-activo={h.id === horizonte} />
        ))}
        <line x1={C} y1={C - R} x2={C} y2={C + R} className="mapa__eje" />
        <line x1={C - R} y1={C} x2={C + R} y2={C} className="mapa__eje" />

        {HORIZONTES.map((h) => (
          <text key={h.id} x={C + 5} y={C - BORDE_HORIZONTE[h.id] + 13} className="mapa__franja" data-activo={h.id === horizonte}>
            {h.etiqueta}
          </text>
        ))}

        <g className="mapa__barrido" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={sector(-(i + 1) * 3, -i * 3, R)} fill="#93c5fd" fillOpacity={Math.round(0.16 * (1 - i / 12) * 1000) / 1000} />
          ))}
          <line x1={C} y1={C} x2={C} y2={C - R} />
        </g>

        {TEMAS.map((t, i) => (
          <text
            key={t}
            x={ESQUINAS[i].x}
            y={ESQUINAS[i].y}
            textAnchor={ESQUINAS[i].ancla}
            className="mapa__tema"
            data-activo={t === tema}
            onClick={() => onTema(t)}
            aria-hidden="true"
          >
            {NOMBRE_TEMA_CORTO[t]}
          </text>
        ))}

        {puntos.map((p) => {
          const enHorizonte = p.tendencia.horizonte_ar === horizonte;
          if (!enHorizonte) {
            return <circle key={p.clave} cx={p.x} cy={p.y} r={p.tam * 0.7} className="mapa__punto-lejano" aria-hidden="true" />;
          }
          return (
            <g
              key={p.clave}
              className="mapa__punto"
              data-activo={p.clave === activa}
              role="button"
              tabIndex={0}
              aria-label={`${NOMBRE_TEMA[p.tendencia.tema]}: ${p.tendencia.nombre}. ${p.tendencia.fuentes.length} fuentes`}
              onClick={() => onTendencia(p.tendencia)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTendencia(p.tendencia);
                }
              }}
              onMouseEnter={() => setSobre(p.clave)}
              onMouseLeave={() => setSobre(null)}
              onFocus={() => setSobre(p.clave)}
              onBlur={() => setSobre(null)}
            >
              <circle cx={p.x} cy={p.y} r={p.tam} className="mapa__eco" style={{ animationDelay: `${Math.round((p.angulo / 360) * VUELTA * 100) / 100}s` }} />
              <circle cx={p.x} cy={p.y} r={p.tam + 7} className="mapa__halo" />
              <circle cx={p.x} cy={p.y} r={p.tam} className="mapa__nucleo" />
            </g>
          );
        })}

        <circle cx={C} cy={C} r={5} className="mapa__centro" />
        <text x={C} y={C + 20} textAnchor="middle" className="mapa__hoy">Argentina hoy</text>
      </svg>

      <p className="mapa__pie" aria-live="polite">
        {visibles.length === 0 ? (
          'No hay tendencias en este horizonte.'
        ) : senalado ? (
          <><b>{senalado.tendencia.nombre}</b> · {NOMBRE_TEMA[senalado.tendencia.tema]}</>
        ) : (
          <>{visibles.length} {visibles.length === 1 ? 'tendencia' : 'tendencias'} en {hz.etiqueta}. Tocá un punto para ver sus fuentes.</>
        )}
      </p>
    </div>
  );
}
