'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Corrida, Horizonte, Tendencia } from '@/lib/tipos';
import type { Origen } from '@/lib/datos';
import type { Portadas } from '@/lib/portadas';
import { HORIZONTES, TEMAS, celdaDe, fechaCorta, fechaLarga, tendenciasDe } from '@/lib/vista';
import Logo, { MarcaTrazo } from './Logo';
import Lluvia from './Lluvia';
import Nodos from './Nodos';
import MapaLaser from './MapaLaser';
import RadarFinn from './RadarFinn';
import TarjetaTema from './TarjetaTema';
import Cadena from './Cadena';
import Ticket from './Ticket';
import BarraScroll from './BarraScroll';
import PanelTendencia from './PanelTendencia';

const CAPITULOS = [
  { id: 'hoy', nombre: 'Hoy' },
  { id: 'viene', nombre: 'Lo que viene' },
  { id: 'brechas', nombre: 'Brechas' },
];

function Encabezado({ n, titulo, bajada }: { n: string; titulo: string; bajada: React.ReactNode }) {
  return (
    <header className="capitulo__cabeza">
      <MarcaTrazo className={`capitulo__marca capitulo__marca--${n}`} />
      <div>
        <h2 className="capitulo__titulo">{titulo}</h2>
        <p className="capitulo__bajada">{bajada}</p>
      </div>
    </header>
  );
}

export default function Tablero({ ediciones, origen = 'respaldo', portadas = {} }: { ediciones: Corrida[]; origen?: Origen; portadas?: Portadas }) {
  const [edicion, setEdicion] = useState(0);
  const [horizonte, setHorizonte] = useState<Horizonte>('corto');
  const [panel, setPanel] = useState<{ lista: Tendencia[]; indice: number } | null>(null);
  const [visible, setVisible] = useState<string>('');
  const opener = useRef<HTMLElement | Element | null>(null);

  const corrida = ediciones[edicion] ?? ediciones[0];
  const lista = tendenciasDe(corrida, horizonte);
  const hz = HORIZONTES.find((h) => h.id === horizonte)!;
  const regionesComparadas = [...new Set(corrida.referencia.map((r) => r.region))].filter((r) => r !== 'AR');

  const elegirHorizonte = (h: Horizonte) => setHorizonte(h);

  const abrir = (l: Tendencia[], indice: number, el?: Element | null) => {
    opener.current = el ?? document.activeElement;
    setPanel({ lista: l, indice });
  };
  const cerrar = useCallback(() => {
    setPanel(null);
    requestAnimationFrame(() => (opener.current as HTMLElement | null)?.focus?.());
  }, []);

  // Mientras el título está seleccionado, los puntos cambian de color para no fundirse con el resaltado violeta.
  useEffect(() => {
    const alCambiar = () => {
      const titulo = document.querySelector<HTMLElement>('.portada__titulo');
      const sel = document.getSelection();
      if (!titulo) return;
      const dentro = !!sel && !sel.isCollapsed && sel.containsNode(titulo, true);
      titulo.toggleAttribute('data-seleccionado', dentro);
    };
    document.addEventListener('selectionchange', alCambiar);
    return () => document.removeEventListener('selectionchange', alCambiar);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => { if (e.isIntersecting) setVisible(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ['portada', ...CAPITULOS.map((c) => c.id)].forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const cambiarEdicion = (n: number) => { setEdicion(n); setPanel(null); };

  return (
    <div className="pagina">
      <nav className="barra" aria-label="Controles">
        <a href="#portada" className="barra__marca">
          <Logo tam={28} />
          Finn
        </a>
        <ul className="barra__anclas">
          {CAPITULOS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className={visible === c.id ? 'es-activo' : undefined} aria-current={visible === c.id ? 'true' : undefined}>
                {c.nombre}
              </a>
            </li>
          ))}
        </ul>
        <div className="barra__controles">
          <label className="edicion">
            <span className="sr">Edición semanal</span>
            <select value={edicion} onChange={(e) => cambiarEdicion(Number(e.target.value))}>
              {ediciones.map((c, n) => (
                <option key={c.corrida} value={n}>{fechaCorta(c.corrida)}</option>
              ))}
            </select>
          </label>
          <span className={`estado-datos estado-datos--${origen === 'en_vivo' && !corrida.ejemplo ? 'vivo' : 'copia'}`}>
            <i aria-hidden="true" />
            {corrida.ejemplo ? 'EJEMPLO' : origen === 'en_vivo' ? 'EN VIVO' : 'COPIA GUARDADA'}
          </span>
        </div>
      </nav>

      {/* ── Portada ── */}
      <section id="portada" className="portada">
        <Lluvia />
        <div className="portada__contenido">
          <div className="portada__texto">
            <p className="portada__kicker">Edición semanal · {fechaLarga(corrida.corrida)}</p>
            <h1 className="portada__titulo" aria-label="Finn">
              <span aria-hidden="true">F<span className="portada__i">ı<i className="punto-finn" /></span>nn<i className="punto-finn punto-finn--final" /></span>
            </h1>
            <p className="portada__lema">Pagos y billeteras en Argentina: una mirada desde los negocios.</p>
            <p className="portada__cifras">
              <span><b>{corrida.totales.noticias}</b> noticias</span>
              <span><b>{corrida.totales.fuentes}</b> fuentes</span>
              <span><b>{corrida.tendencias.length}</b> tendencias</span>
            </p>
          </div>
          <RadarFinn
            tendencias={corrida.tendencias}
            portadas={portadas}
            onAbrir={(t, el) => {
              const l = tendenciasDe(corrida, t.horizonte_ar);
              if (t.horizonte_ar !== horizonte) elegirHorizonte(t.horizonte_ar);
              abrir(l, l.indexOf(t), el);
            }}
          />
        </div>
      </section>

      {/* ── 01 Hoy ── */}
      <section id="hoy" className="seccion seccion--hoy">
        <div className="capitulo">
          <Encabezado
            n="01"
            titulo="¿Qué está pasando hoy?"
            bajada={<>El nivel de adopción de <b className="res res--dato">Argentina</b> en cada tema (0 a 3) y cómo está frente al mundo. Tocá una tarjeta para darla vuelta.</>}
          />
          <div className="tarjetas">
            {TEMAS.map((t, i) => {
              const datos = corrida.temas.find((x) => x.tema === t);
              const celda = celdaDe(corrida.celdas, t, 'AR')?.adopcion;
              const ref = corrida.referencia.find((r) => r.tema === t && r.region === 'AR')?.nivel;
              const nivel = celda ?? (ref === undefined ? null : Math.round(ref));
              const delTema = lista.filter((x) => x.tema === t);
              return (
                <TarjetaTema
                  key={`${corrida.corrida}-${t}`}
                  tema={t}
                  datos={datos}
                  nivelAR={nivel}
                  indice={i}
                  hayTendencias={delTema.length > 0}
                  onVerTendencias={() => abrir(lista, lista.indexOf(delTema[0]))}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 02 Lo que viene ── */}
      <section id="viene" className="seccion seccion--viene">
        <Nodos />
        <div className="capitulo">
          <Encabezado
            n="02"
            titulo="¿Qué puede venir?"
            bajada={<>Cada tendencia es un bloque de la cadena. Estás viendo el <b className="res res--acento">{hz.largo.toLowerCase()}</b> ({hz.etiqueta}): <b className="res res--dato">{lista.length}</b> {lista.length === 1 ? 'bloque' : 'bloques'}. Tocá uno para ver el resumen y la noticia original.</>}
          />
          <Cadena
            lista={lista}
            horizonte={horizonte}
            onHorizonte={elegirHorizonte}
            onAbrir={(t, el) => abrir(lista, lista.indexOf(t), el)}
            portadas={portadas}
          />
        </div>
      </section>

      {/* ── 03 Brechas ── */}
      <section id="brechas" className="seccion seccion--brechas">
        <MapaLaser regiones={regionesComparadas} />
        <div className="capitulo">
          <Encabezado
            n="03"
            titulo="¿Dónde están las brechas?"
            bajada={<>Nivel de adopción de 0 a 3 de <b className="res res--dato">Argentina</b> frente a <b className="res res--dato">Brasil</b>, <b className="res res--dato">México</b>, <b className="res res--dato">EE.UU.</b> y <b className="res res--dato">Europa</b>. Cada línea lleva a su fuente.</>}
          />
          <div className="tickets">
            {TEMAS.map((t, i) => (
              <Ticket
                key={t}
                tema={t}
                numero={i + 1}
                datos={corrida.temas.find((x) => x.tema === t)}
                referencia={corrida.referencia.filter((r) => r.tema === t)}
              />
            ))}
          </div>
        </div>
      </section>

      <BarraScroll />

      {panel && (
        <PanelTendencia
          lista={panel.lista}
          indice={panel.indice}
          onIndice={(i) => setPanel({ ...panel, indice: i })}
          onCerrar={cerrar}
          portadas={portadas}
        />
      )}
    </div>
  );
}
