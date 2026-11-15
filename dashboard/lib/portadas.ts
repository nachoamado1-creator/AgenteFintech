import { cacheLife } from 'next/cache';
import type { Corrida } from './tipos';

/** Mapa nota → imagen de portada (solo las notas que tienen una). */
export type Portadas = Record<string, string>;

const MAX_BYTES = 150_000;
const ESPERA_MS = 5000;

function atributo(etiqueta: string, nombre: string): string | null {
  const m = etiqueta.match(new RegExp(`${nombre}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3] ?? null) : null;
}

/** Busca la imagen de portada (og:image o twitter:image) en el HTML de una nota. */
export function extraerPortada(html: string, base: string): string | null {
  const etiquetas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const claves = ['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'twitter:image:src'];
  for (const clave of claves) {
    for (const e of etiquetas) {
      const nombre = (atributo(e, 'property') ?? atributo(e, 'name') ?? '').toLowerCase();
      const valor = atributo(e, 'content');
      if (nombre !== clave || !valor) continue;
      try {
        const url = new URL(valor.replace(/&amp;/g, '&').trim(), base);
        if (url.protocol === 'https:' || url.protocol === 'http:') return url.href.replace(/^http:/, 'https:');
      } catch { /* sigue con la próxima */ }
    }
  }
  return null;
}

/** Lee solo el principio de la nota (alcanza para el <head>) y devuelve su portada. */
async function portadaDe(url: string): Promise<string | null> {
  'use cache';
  cacheLife('days');
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(ESPERA_MS),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; RadarFintech/1.0)', accept: 'text/html' },
    });
    if (!r.ok || !r.body) return null;
    const lector = r.body.getReader();
    const decodificador = new TextDecoder();
    let html = '';
    while (html.length < MAX_BYTES) {
      const { done, value } = await lector.read();
      if (done) break;
      html += decodificador.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    lector.cancel().catch(() => {});
    return extraerPortada(html, r.url || url);
  } catch {
    return null;
  }
}

/** Trae la portada de cada nota de las ediciones. Si una falla, esa nota queda sin imagen. */
export async function obtenerPortadas(ediciones: Corrida[]): Promise<Portadas> {
  const urls = [...new Set(ediciones.flatMap((c) => c.tendencias.flatMap((t) => t.fuentes.map((f) => f.url))))];
  const portadas: Portadas = {};
  const LOTE = 12;
  for (let i = 0; i < urls.length; i += LOTE) {
    const lote = urls.slice(i, i + LOTE);
    const imagenes = await Promise.all(lote.map(portadaDe));
    lote.forEach((u, n) => { const img = imagenes[n]; if (img) portadas[u] = img; });
  }
  return portadas;
}
