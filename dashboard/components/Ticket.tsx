import type { Referencia, Tema, TemaId } from '@/lib/tipos';
import { COLOR_TEMA } from '@/lib/fintech';
import { NOMBRE_TEMA } from '@/lib/vista';

const REGIONES = [
  { id: 'AR', nombre: 'Argentina' },
  { id: 'BR', nombre: 'Brasil' },
  { id: 'MX', nombre: 'México' },
  { id: 'US', nombre: 'EE.UU.' },
  { id: 'EU', nombre: 'Europa' },
] as const;

function Estado({ estado, brecha }: { estado: Tema['estado_global']; brecha: number | null }) {
  if (!estado) return <b className="res res--nula">S/D</b>;
  const signo = brecha === null || brecha === 0 ? '' : ` ${brecha > 0 ? '+' : '−'}${Math.abs(brecha)}`;
  return <b className={`res res--${estado}`}>{estado.toUpperCase()}{signo}</b>;
}

/** Comprobante de brechas de un tema: Argentina frente a cada referencia. */
export default function Ticket({ tema, datos, referencia, numero }: { tema: TemaId; datos?: Tema; referencia: Referencia[]; numero: number }) {
  return (
    <article className="ticket" style={{ '--c': COLOR_TEMA[tema] } as React.CSSProperties}>
      <header className="ticket__cabeza">
        <span className="ticket__marca">FINN · COMPROBANTE</span>
        <h3 className="ticket__tema">{NOMBRE_TEMA[tema]}</h3>
        <span className="ticket__nro">N.º {String(numero).padStart(4, '0')} · ADOPCIÓN 0–3</span>
      </header>
      <ul className="ticket__lineas">
        {REGIONES.map((r) => {
          const ref = referencia.find((x) => x.region === r.id);
          const nivel = ref ? Math.max(0, Math.min(3, Math.round(ref.nivel))) : null;
          const fila = (
            <>
              <span className="ticket__region">{r.id} <small>{r.nombre}</small></span>
              <span className="ticket__puntos" aria-hidden="true">
                {nivel === null ? '' : '●'.repeat(nivel) + '○'.repeat(3 - nivel)}
              </span>
              <span className="ticket__nivel">{nivel === null ? 's/d' : `${nivel}/3`}</span>
              {ref?.url ? <span className="ticket__sello">VERIFICADO ↗</span> : <span />}
            </>
          );
          return (
            <li key={r.id} className={r.id === 'AR' ? 'es-ar' : undefined} title={ref ? `${ref.valor} — ${ref.que_mide}` : undefined}>
              {ref?.url ? (
                <a href={ref.url} target="_blank" rel="noopener noreferrer" aria-label={`${r.nombre}: nivel ${nivel} de 3, ver fuente`}>{fila}</a>
              ) : (
                <div>{fila}</div>
              )}
            </li>
          );
        })}
      </ul>
      <footer className="ticket__total">
        <div><span>VS BRASIL / MÉXICO</span><Estado estado={datos?.estado_regional ?? null} brecha={datos?.brecha_regional ?? null} /></div>
        <div className="ticket__total-final"><span>TOTAL BRECHA · VS MUNDO</span><Estado estado={datos?.estado_global ?? null} brecha={datos?.brecha_global ?? null} /></div>
        <p className="ticket__gracias">*** brecha = nivel de Argentina − nivel de la región ***</p>
      </footer>
    </article>
  );
}
