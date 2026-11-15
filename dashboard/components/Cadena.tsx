'use client';

import type { Horizonte, Tendencia } from '@/lib/tipos';
import { COLOR_TEMA, IMAGEN_TEMA, hashCorto, portadaDeTendencia } from '@/lib/fintech';
import { HORIZONTES, NOMBRE_TEMA } from '@/lib/vista';
import Portada from './Portada';

/** Las tendencias de un horizonte como una cadena de bloques. */
export default function Cadena({
  lista, horizonte, onHorizonte, onAbrir, portadas,
}: {
  lista: Tendencia[];
  horizonte: Horizonte;
  onHorizonte: (h: Horizonte) => void;
  onAbrir: (t: Tendencia, el: HTMLElement) => void;
  portadas: Record<string, string>;
}) {
  return (
    <div className="cadena">
      <ol className="linea-tiempo" aria-label="Horizontes">
        {HORIZONTES.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              className={`linea-tiempo__nodo${h.id === horizonte ? ' es-activo' : ''}`}
              aria-pressed={h.id === horizonte}
              onClick={() => onHorizonte(h.id)}
            >
              <span className="linea-tiempo__punto" aria-hidden="true" />
              <b>{h.largo}</b>
              <small>{h.etiqueta}</small>
            </button>
          </li>
        ))}
      </ol>

      {lista.length === 0 ? (
        <div className="bloque bloque--vacio">
          <span className="bloque__hash">#0000</span>
          <p>Sin bloques minados en este horizonte</p>
        </div>
      ) : (
        <ol className="cadena__bloques" key={horizonte}>
          {lista.map((t, i) => {
            const color = COLOR_TEMA[t.tema];
            return (
              <li key={`${t.tema}|${t.nombre}`} className="cadena__eslabon" style={{ '--c': color, '--i': i } as React.CSSProperties}>
                <button type="button" className="bloque" onClick={(e) => onAbrir(t, e.currentTarget)}>
                  <span className="bloque__img">
                    <Portada src={portadaDeTendencia(t, portadas)} respaldo={IMAGEN_TEMA[t.tema]} clase="bloque__foto" />
                  </span>
                  <span className="bloque__meta">
                    <span className="bloque__hash">{hashCorto(t.nombre)}</span>
                    <span className="bloque__altura">BLOQUE {String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="bloque__nombre">{t.nombre}</span>
                  <span className="bloque__pie">
                    <span className="chip-tema">{NOMBRE_TEMA[t.tema]}</span>
                    <span className="bloque__fuentes">{t.fuentes.length} {t.fuentes.length === 1 ? 'fuente' : 'fuentes'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
