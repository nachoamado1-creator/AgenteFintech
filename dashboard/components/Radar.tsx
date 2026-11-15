'use client';

import { useState } from 'react';
import type { Corrida, Estado, Horizonte, TemaId, Tendencia } from '@/lib/tipos';
import type { Origen } from '@/lib/datos';
import type { Portadas } from '@/lib/portadas';
import Portada from './Portada';
import {
  HORIZONTES, NOMBRE_NIVEL, NOMBRE_REGION, NOMBRE_TEMA, NOMBRE_TEMA_CORTO, TEMAS,
  celdaDe, claveTendencia, dominio, fechaCorta, fechaLarga, tendenciasDe, textoEstado,
} from '@/lib/vista';
import MapaRadar from './MapaRadar';
import Carrusel from './Carrusel';

type Seleccion = { tipo: 'tema'; tema: TemaId } | { tipo: 'tendencia'; clave: string };

function Segmentado<T extends string>({
  opciones, valor, onCambio, etiqueta, tamano = 'grande',
}: {
  opciones: { id: T; etiqueta: string }[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
  tamano?: 'grande' | 'chico';
}) {
  const indice = Math.max(0, opciones.findIndex((o) => o.id === valor));
  return (
    <div
      className={`segmentado segmentado--${tamano}`}
      role="radiogroup"
      aria-label={etiqueta}
      style={{ '--n': opciones.length, '--i': indice } as React.CSSProperties}
    >
      <span className="segmentado__pastilla" aria-hidden="true" />
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === valor}
          className="segmentado__opcion"
          onClick={() => onCambio(o.id)}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

function Etiqueta({ estado, brecha }: { estado: Estado; brecha: number | null }) {
  return <span className={`etiqueta etiqueta--${estado ?? 'nula'}`}>{textoEstado(estado, brecha)}</span>;
}

export default function Radar({ ediciones, portadas = {} }: { ediciones: Corrida[]; origen?: Origen; portadas?: Portadas }) {
  const [edicion, setEdicion] = useState(0);
  const [horizonte, setHorizonte] = useState<Horizonte>('corto');
  const [tema, setTema] = useState<TemaId>('pagos_instantaneos');
  const [sel, setSel] = useState<Seleccion>({ tipo: 'tema', tema: 'pagos_instantaneos' });

  const corrida = ediciones[edicion] ?? ediciones[0];
  const lista = tendenciasDe(corrida, horizonte);
  const hz = HORIZONTES.find((h) => h.id === horizonte)!;
  const numeroEdicion = ediciones.length - edicion;

  /** En celular el detalle queda abajo: al elegir algo se lleva la vista hasta él. */
  const elegir = (s: Seleccion) => {
    setSel(s);
    if (window.matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => document.getElementById('detalle')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };
  const abrirTendencia = (t: Tendencia) => elegir({ tipo: 'tendencia', clave: claveTendencia(t) });
  const cambiarTema = (t: TemaId) => {
    setTema(t);
    setSel({ tipo: 'tema', tema: t });
  };
  const cambiarEdicion = (n: number) => {
    setEdicion(n);
    const nueva = ediciones[n];
    if (sel.tipo === 'tendencia' && !nueva.tendencias.some((t) => claveTendencia(t) === sel.clave)) {
      setTema(TEMAS[0]);
      setSel({ tipo: 'tema', tema: TEMAS[0] });
    }
  };

  const datosTema = corrida.temas.find((t) => t.tema === tema);
  const nivel = (r: 'AR' | 'LATAM' | 'GLOBAL') => celdaDe(corrida.celdas, tema, r)?.adopcion ?? null;
  const estimado = (r: 'AR' | 'LATAM' | 'GLOBAL') => celdaDe(corrida.celdas, tema, r)?.origen === 'estimado';
  const ar = nivel('AR');

  return (
    <div className="pagina">
      <div className="orbes" aria-hidden="true">
        <span className="orbe orbe--azul" />
        <span className="orbe orbe--violeta" />
        <span className="orbe orbe--indigo" />
      </div>
      <div className="grano" aria-hidden="true" />

      <header className="cabecera">
        <p className="cabecera__fuentes">Pagos · Billeteras · Argentina</p>

        <div className="cabecera__marca">
          <svg className="cabecera__radar" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="barrido" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#6366f1" stopOpacity="0.7" />
                <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" className="radar-aro" />
            <circle cx="50" cy="50" r="30" className="radar-fino" />
            <circle cx="50" cy="50" r="14" className="radar-fino" />
            <path d="M50 2V98M2 50H98" className="radar-fino" />
            <path className="radar-barrido" d="M50 50 L50 2 A48 48 0 0 1 84 16 Z" fill="url(#barrido)" />
            <circle cx="66" cy="38" r="5" className="radar-punto" />
          </svg>
          <div className="cabecera__texto">
            <p className="cabecera__kicker">Edición semanal</p>
            <h1 className="cabecera__titulo">
              <span>Radar</span> <em>Fintech</em>
            </h1>
          </div>
        </div>

        <p className="cabecera__lema">Pagos y billeteras en Argentina: una mirada desde los negocios</p>
        <p className="cabecera__bajada">
          Qué pasa hoy, qué puede venir y dónde están las brechas frente a Brasil, México, EE.UU. y Europa.
        </p>

        <div className="cabecera__barra">
          <span>Edición N.º {numeroEdicion}</span>
          <span>{fechaLarga(corrida.corrida)}</span>
          <label className="selector">
            <span className="selector__rotulo">Edición</span>
            <span className="selector__caja">
              <select value={edicion} onChange={(e) => cambiarEdicion(Number(e.target.value))}>
                {ediciones.map((c, n) => (
                  <option key={c.corrida} value={n}>
                    N.º {ediciones.length - n} — {fechaCorta(c.corrida)}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
            </span>
          </label>
        </div>

        <div className="cabecera__controles">
          <Segmentado opciones={HORIZONTES} valor={horizonte} onCambio={setHorizonte} etiqueta="Horizonte temporal" />
          <p className="cabecera__totales">
            <b>{corrida.totales.noticias}</b> noticias · <b>{corrida.totales.fuentes}</b> fuentes · <b>{corrida.tendencias.length}</b> tendencias
          </p>
        </div>
        {corrida.provisorio && (
          <p className="cabecera__aviso">Resúmenes provisorios: la próxima corrida con IA los reemplaza.</p>
        )}
      </header>

      <main className="bento">
        {/* Carrusel de tendencias */}
        <section className="tarjeta tendencias" aria-labelledby="t-tend">
          <div className="tarjeta__cabeza">
            <div>
              <p className="rotulo">¿Qué puede venir? · {hz.largo}</p>
              <h2 id="t-tend" className="tarjeta__titulo">
                {lista.length} {lista.length === 1 ? 'tendencia' : 'tendencias'} <span className="texto-3">en {hz.etiqueta}</span>
              </h2>
            </div>
          </div>
          <Carrusel lista={lista} activa={sel.tipo === 'tendencia' ? sel.clave : null} onAbrir={abrirTendencia} portadas={portadas} />
        </section>

        {/* Argentina hoy, frente al mundo */}
        <section className="tarjeta mundo" aria-labelledby="t-mundo">
          <div className="tarjeta__cabeza">
            <div>
              <p className="rotulo">¿Qué pasa hoy?</p>
              <h2 id="t-mundo" className="tarjeta__titulo">Argentina hoy, frente al mundo</h2>
            </div>
            <div className="mundo__selector">
              <Segmentado
                opciones={TEMAS.map((t) => ({ id: t, etiqueta: NOMBRE_TEMA_CORTO[t] }))}
                valor={tema}
                onCambio={cambiarTema}
                etiqueta="Tema"
                tamano="chico"
              />
            </div>
          </div>

          <div className="mundo__cuerpo">
            <MapaRadar
              tendencias={corrida.tendencias}
              horizonte={horizonte}
              tema={tema}
              activa={sel.tipo === 'tendencia' ? sel.clave : null}
              onTema={cambiarTema}
              onTendencia={abrirTendencia}
            />

            <ul className="mundo__leyenda" aria-label={`Adopción en ${NOMBRE_TEMA[tema]}`}>
              <li className="mundo__leyenda-titulo">{NOMBRE_TEMA[tema]} · adopción de 0 a 3</li>
              <li>
                <span className="punto punto--ar" aria-hidden="true" />
                <span className="mundo__region">{NOMBRE_REGION.AR}{estimado('AR') && <em> · estimado</em>}</span>
                <span className="mundo__nivel">{ar === null ? 'Sin datos' : `${ar} · ${NOMBRE_NIVEL[ar]}`}</span>
              </li>
              {(['LATAM', 'GLOBAL'] as const).map((r) => {
                const n = nivel(r);
                const est = r === 'LATAM' ? datosTema?.estado_regional ?? null : datosTema?.estado_global ?? null;
                const br = r === 'LATAM' ? datosTema?.brecha_regional ?? null : datosTema?.brecha_global ?? null;
                return (
                  <li key={r}>
                    <span className={`punto punto--${r.toLowerCase()}`} aria-hidden="true" />
                    <span className="mundo__region">{NOMBRE_REGION[r]}{estimado(r) && <em> · estimado</em>}</span>
                    <span className="mundo__nivel">{n === null ? 'Sin datos' : `${n} · ${NOMBRE_NIVEL[n]}`}</span>
                    <span className="mundo__brecha">
                      <span className="texto-3">Argentina</span>
                      <Etiqueta estado={est} brecha={br} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Detalle */}
        <Detalle corrida={corrida} sel={sel} onTema={cambiarTema} portadas={portadas} />
      </main>

      <footer className="pie">
        <span>Radar Fintech · Trabajo práctico</span>
        <span>Generado el {fechaLarga(corrida.generado)}</span>
      </footer>
    </div>
  );
}

function Detalle({ corrida, sel, onTema, portadas }: { corrida: Corrida; sel: Seleccion; onTema: (t: TemaId) => void; portadas: Portadas }) {
  if (sel.tipo === 'tendencia') {
    const t = corrida.tendencias.find((x) => claveTendencia(x) === sel.clave);
    if (t) {
      const hz = HORIZONTES.find((h) => h.id === t.horizonte_ar)!;
      return (
        <aside id="detalle" className="tarjeta detalle" aria-live="polite" key={sel.clave}>
          {t.fuentes.some((f) => portadas[f.url]) && (
            <Portada src={t.fuentes.map((f) => portadas[f.url]).find(Boolean)} clase="detalle__portada" />
          )}
          <button type="button" className="detalle__volver" onClick={() => onTema(t.tema)}>
            ← Ver el tema {NOMBRE_TEMA[t.tema]}
          </button>
          <p className="rotulo">Tendencia · {NOMBRE_TEMA[t.tema]}</p>
          <h2 className="detalle__titulo">{t.nombre}</h2>
          <div className="detalle__pildoras">
            <span className="pildora pildora--clara">{hz.largo} · {hz.etiqueta}</span>
          </div>
          <p className="detalle__resumen">{t.resumen}</p>
          <h3 className="detalle__sub">Fuentes ({t.fuentes.length})</h3>
          <ul className="fuentes">
            {t.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className={portadas[f.url] ? 'fuentes__con-foto' : undefined}>
                  {portadas[f.url] && <Portada src={portadas[f.url]} clase="fuentes__foto" />}
                  <span className="fuentes__texto">
                    <span className="fuentes__cabeza">
                      <b>{f.fuente}</b>
                      <time dateTime={f.fecha}>{fechaLarga(f.fecha)}</time>
                    </span>
                    {f.cita && <q>{f.cita}</q>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      );
    }
  }

  const temaId = sel.tipo === 'tema' ? sel.tema : TEMAS[0];
  const t = corrida.temas.find((x) => x.tema === temaId) ?? corrida.temas[0];
  if (!t) return null;
  const hz = HORIZONTES.find((h) => h.id === t.horizonte_ar)!;
  const urls = Array.from(new Set([
    ...corrida.referencia.filter((r) => r.tema === t.tema).map((r) => r.url),
    ...corrida.celdas.filter((c) => c.tema === t.tema).flatMap((c) => c.urls),
  ]));

  return (
    <aside id="detalle" className="tarjeta detalle" aria-live="polite" key={`tema-${t.tema}`}>
      <p className="rotulo">Tema · llega en {hz.etiqueta}</p>
      <h2 className="detalle__titulo">{NOMBRE_TEMA[t.tema]}</h2>
      <p className="detalle__resumen">{t.resumen}</p>

      <dl className="detalle__datos">
        <div><dt>Quiénes se mueven</dt><dd>{t.proveedores}</dd></div>
        <div><dt>Inversión y capacidad</dt><dd>{t.inversion}</dd></div>
      </dl>

      <h3 className="detalle__sub">Qué mirar</h3>
      <ul className="indicadores">
        {t.indicadores.map((i) => <li key={i}>{i}</li>)}
      </ul>

      <h3 className="detalle__sub">Fuentes ({urls.length})</h3>
      <ul className="fuentes fuentes--compactas">
        {urls.slice(0, 8).map((u) => (
          <li key={u}>
            <a href={u} target="_blank" rel="noopener noreferrer"><b>{dominio(u)}</b><span aria-hidden="true">↗</span></a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
