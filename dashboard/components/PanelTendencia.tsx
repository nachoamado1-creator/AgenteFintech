'use client';

import { useEffect, useRef } from 'react';
import type { Tendencia } from '@/lib/tipos';
import { COLOR_TEMA, IMAGEN_TEMA, hashCorto, portadaDeTendencia, resaltar } from '@/lib/fintech';
import { HORIZONTES, NOMBRE_TEMA, fechaCorta } from '@/lib/vista';
import Portada from './Portada';
import Texto from './Texto';

/** Panel lateral con el detalle de una tendencia y los links a las noticias originales. */
export default function PanelTendencia({
  lista, indice, onIndice, onCerrar, portadas,
}: {
  lista: Tendencia[];
  indice: number;
  onIndice: (i: number) => void;
  onCerrar: () => void;
  portadas: Record<string, string>;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const t = lista[indice];

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => { document.body.style.overflow = previo; };
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCerrar(); return; }
      if (e.key === 'Tab' && panel.current) {
        const focos = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]');
        if (!focos.length) return;
        const primero = focos[0], ultimo = focos[focos.length - 1];
        if (e.shiftKey && (document.activeElement === primero || document.activeElement === panel.current)) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [onCerrar]);

  if (!t) return null;
  const hz = HORIZONTES.find((h) => h.id === t.horizonte_ar)!;
  const color = COLOR_TEMA[t.tema];

  return (
    <div className="panel-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div
        ref={panel}
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-titulo"
        tabIndex={-1}
        style={{ '--c': color } as React.CSSProperties}
      >
        <div className="panel__barra">
          <span className="panel__hash">{hashCorto(t.nombre)} · {indice + 1}/{lista.length}</span>
          <div className="panel__nav">
            <button type="button" onClick={() => onIndice((indice - 1 + lista.length) % lista.length)} aria-label="Tendencia anterior" disabled={lista.length < 2}>←</button>
            <button type="button" onClick={() => onIndice((indice + 1) % lista.length)} aria-label="Tendencia siguiente" disabled={lista.length < 2}>→</button>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className="panel__cerrar">✕</button>
          </div>
        </div>

        <div className="panel__scroll" key={`${t.tema}|${t.nombre}`}>
          <div className="panel__portada">
            <Portada src={portadaDeTendencia(t, portadas)} respaldo={IMAGEN_TEMA[t.tema]} clase="panel__foto" />
            <span className="panel__velo" aria-hidden="true" />
          </div>

          <div className="panel__cuerpo">
            <div className="panel__chips">
              <span className="chip-tema">{NOMBRE_TEMA[t.tema]}</span>
              <span className="chip">{hz.etiqueta}</span>
            </div>
            <h2 id="panel-titulo" className="panel__titulo">{t.nombre}</h2>
            <p className="panel__resumen"><Texto trozos={resaltar(t.resumen)} /></p>

            <h3 className="panel__sub">Fuentes · {t.fuentes.length}</h3>
            {t.fuentes.length === 0 ? (
              <p className="panel__vacio">Sin fuente registrada</p>
            ) : (
              <ul className="panel__fuentes">
                {t.fuentes.map((f) => (
                  <li key={f.url}>
                    <div className="panel__fuente-cabeza">
                      <b>{f.fuente}</b>
                      <time dateTime={f.fecha}>{fechaCorta(f.fecha)}</time>
                    </div>
                    {f.cita && <q>{f.cita}</q>}
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="boton-fuente">
                      Leer la noticia original <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
