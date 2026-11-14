import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import esquema from '../data/radar.schema.json';
import respaldo from '../data/ultima-corrida.json';
import guardadas from '../data/ediciones.json';
import type { Corrida } from './tipos';

const ajv = new Ajv2020({ strict: true });
addFormats(ajv);
const validar = ajv.compile(esquema);

export type Origen = 'en_vivo' | 'respaldo';

async function pedirEnVivo(): Promise<Corrida | null> {
  const url = process.env.RADAR_API_URL;
  if (!url) return null;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!r.ok) return null;
    const datos = await r.json();
    return validar(datos) ? (datos as unknown as Corrida) : null;
  } catch {
    return null;
  }
}

/** Pide la última corrida al webhook de n8n; si falla o no cumple el contrato, usa la copia guardada. */
export async function obtenerCorrida(): Promise<{ corrida: Corrida; origen: Origen }> {
  const enVivo = await pedirEnVivo();
  if (enVivo) return { corrida: enVivo, origen: 'en_vivo' };
  return { corrida: respaldo as unknown as Corrida, origen: 'respaldo' };
}

/** Deja una edición por día (la generada más tarde) y ordena de la más nueva a la más vieja. */
export function unaPorDia(corridas: Corrida[]): Corrida[] {
  const porDia = new Map<string, Corrida>();
  for (const c of corridas) {
    const previa = porDia.get(c.corrida);
    if (!previa || c.generado > previa.generado) porDia.set(c.corrida, c);
  }
  return [...porDia.values()].sort((a, b) => (a.corrida < b.corrida ? 1 : -1));
}

/**
 * Todas las ediciones disponibles: las guardadas en el repositorio más la que llega en vivo.
 * Si el agente no responde, igual quedan las guardadas (y como mínimo la copia de respaldo).
 */
export async function obtenerEdiciones(): Promise<{ ediciones: Corrida[]; origen: Origen }> {
  const enVivo = await pedirEnVivo();
  const locales = (guardadas as unknown[]).filter((c) => validar(c)) as unknown as Corrida[];
  const base = locales.length ? locales : [respaldo as unknown as Corrida];
  return {
    ediciones: unaPorDia(enVivo ? [enVivo, ...base] : base),
    origen: enVivo ? 'en_vivo' : 'respaldo',
  };
}
