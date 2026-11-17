'use client';

import { useRef, useSyncExternalStore } from 'react';
import type { Horizonte, Tendencia } from '@/lib/tipos';
import { COLOR_TEMA, IMAGEN_TEMA, hashCorto, portadaDeTendencia } from '@/lib/fintech';
import { HORIZONTES, NOMBRE_TEMA } from '@/lib/vista';
import Portada from './Portada';
import GlassFolder, { type ArtRecipe } from './ui/glass-folder-cards';

/** Arte de cada carpeta, en los azules y violetas del dashboard. */
const ARTE: Record<Horizonte, ArtRecipe> = {
  corto: { style: 'marble', colors: ['#06060c', '#141433', '#3b3f9e', '#7c8cff', '#c9d0ff', '#f0f2ff'], scale: 0.7, warp: 3.2, angle: -0.5, gloss: 0.5, veins: 0.4 },
  mediano: { style: 'marble', colors: ['#07060f', '#22164a', '#5b3fc4', '#a372ff', '#dcc8ff', '#f6f0ff'], scale: 0.72, warp: 3.5, angle: 0.8, gloss: 0.5, veins: 0.4 },
  largo: { style: 'streak', colors: ['#05050b', '#1a1a3e', '#7766f8', '#2a1f5c', '#9fa9ff', '#eef0ff'], scale: 0.7, warp: 1.6, angle: -0.6, gloss: 0.25, veins: 0 },
};

const ANCHO_CARPETA = 300;

/** Ancho de las carpetas: 300 px, o menos si la pantalla no da (16 px de margen a cada lado). */
function useAnchoCarpeta(): number {
  return useSyncExternalStore(
    (cb) => { window.addEventListener('resize', cb); return () => window.removeEventListener('resize', cb); },
    () => Math.min(ANCHO_CARPETA, window.innerWidth - 32),
    () => ANCHO_CARPETA,
  );
}

/** Las tendencias de cada horizonte guardadas en una carpeta; al abrirla, sus bloques en un carrusel. */
export default function Cadena({
  listas, abierta, onAbierta, onAbrir, portadas, edicion,
}: {
  listas: Record<Horizonte, Tendencia[]>;
  abierta: Horizonte | null;
  onAbierta: (h: Horizonte | null) => void;
  onAbrir: (lista: Tendencia[], indice: number, el: HTMLElement | null) => void;
  portadas: Record<string, string>;
  edicion: string;
}) {
  const ancho = useAnchoCarpeta();
  const carrusel = useRef<HTMLOListElement>(null);
  const lista = abierta ? listas[abierta] : [];

  const mover = (dir: 1 | -1) => {
    const el = carrusel.current;
    if (!el) return;
    // El scroll-snap alinea cada bloque con el borde del carrusel: esa es la posición de "inicio".
    const inicio = el.getBoundingClientRect().left;
    const tarjetas = [...el.querySelectorAll<HTMLElement>('.cadena__eslabon')];
    const destino = dir === 1
      ? tarjetas.find((t) => t.getBoundingClientRect().left > inicio + 5)
      : tarjetas.findLast((t) => t.getBoundingClientRect().left < inicio - 5);
    if (destino) el.scrollBy({ left: destino.getBoundingClientRect().left - inicio, behavior: 'smooth' });
  };

  return (
    <div className="cadena">
      <div className="carpetas" role="group" aria-label="Horizontes">
        {HORIZONTES.map((h, n) => {
          const l = listas[h.id];
          return (
            <GlassFolder
              key={`${edicion}-${h.id}`}
              label={h.largo}
              meta={`${h.etiqueta} · ${l.length} ${l.length === 1 ? 'noticia' : 'noticias'}`}
              itemWords={['noticia', 'noticias']}
              tone="dark"
              art={ARTE[h.id]}
              seed={n + 3}
              action="none"
              width={ancho}
              appearDelay={n * 140}
              open={abierta === h.id}
              onOpenChange={(o) => onAbierta(o ? h.id : null)}
              files={l.map((t) => ({
                name: t.nombre,
                meta: NOMBRE_TEMA[t.tema],
                image: portadaDeTendencia(t, portadas) ?? IMAGEN_TEMA[t.tema],
              }))}
              onFileSelect={(_, i) => onAbrir(l, i, document.activeElement as HTMLElement | null)}
            />
          );
        })}
      </div>

      {abierta && (
        lista.length === 0 ? (
          <div className="bloque bloque--vacio">
            <span className="bloque__hash">#0000</span>
            <p>Sin bloques minados en este horizonte</p>
          </div>
        ) : (
          <div className="carrusel">
            <div className="carrusel__cabeza">
              <span className="carrusel__titulo">{HORIZONTES.find((h) => h.id === abierta)!.largo}</span>
              <div className="carrusel__flechas">
                <button type="button" className="carrusel__flecha" aria-label="Noticia anterior" onClick={() => mover(-1)}>←</button>
                <button type="button" className="carrusel__flecha" aria-label="Noticia siguiente" onClick={() => mover(1)}>→</button>
              </div>
            </div>
            <ol className="cadena__bloques" key={abierta} ref={carrusel}>
              {lista.map((t, i) => {
                const color = COLOR_TEMA[t.tema];
                return (
                  <li key={`${t.tema}|${t.nombre}`} className="cadena__eslabon" style={{ '--c': color, '--i': i } as React.CSSProperties}>
                    <button type="button" className="bloque" onClick={(e) => onAbrir(lista, i, e.currentTarget)}>
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
          </div>
        )
      )}
    </div>
  );
}
