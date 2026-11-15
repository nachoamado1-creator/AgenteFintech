import type { Trozo } from '@/lib/fintech';
import { COLOR_TEMA } from '@/lib/fintech';

/** Pinta trozos de texto con los resaltados de color (temas, estados, datos). */
export default function Texto({ trozos }: { trozos: Trozo[] }) {
  return (
    <>
      {trozos.map((t, i) => {
        if (t.tipo === 'texto') return <span key={i}>{t.texto}</span>;
        if (t.tipo === 'tema') return <b key={i} className="res res--tema" style={{ color: COLOR_TEMA[t.tema] }}>{t.texto}</b>;
        if (t.tipo === 'estado') return <b key={i} className={`res res--${t.estado}`}>{t.texto}</b>;
        return <b key={i} className="res res--dato">{t.texto}</b>;
      })}
    </>
  );
}
