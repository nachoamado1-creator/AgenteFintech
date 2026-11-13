import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import esquema from '../data/radar.schema.json';
import respaldo from '../data/ultima-corrida.json';
import type { Corrida } from './tipos';

const ajv = new Ajv2020({ strict: true });
addFormats(ajv);
const validar = ajv.compile(esquema);

export type Origen = 'en_vivo' | 'respaldo';

/** Pide la última corrida al webhook de n8n; si falla o no cumple el contrato, usa la copia guardada. */
export async function obtenerCorrida(): Promise<{ corrida: Corrida; origen: Origen }> {
  const url = process.env.RADAR_API_URL;
  if (url) {
    try {
      const r = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
      if (r.ok) {
        const datos = await r.json();
        if (validar(datos)) return { corrida: datos as unknown as Corrida, origen: 'en_vivo' };
      }
    } catch {
      /* se usa el respaldo */
    }
  }
  return { corrida: respaldo as unknown as Corrida, origen: 'respaldo' };
}
