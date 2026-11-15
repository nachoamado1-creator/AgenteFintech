import type { Estado, TemaId, Tendencia } from './tipos';

/** Color fijo de cada tema (gama azul → violeta): se repite en tarjeta, bloque, ticket, panel y texto. */
export const COLOR_TEMA: Record<TemaId, string> = {
  pagos_instantaneos: '#5EB8FF',
  open_finance: '#7C8CFF',
  stablecoins: '#A68BFF',
  ia_aplicada: '#D38BFF',
};

/** Imagen fija de cada tema (Unsplash), también usada cuando una nota no tiene portada. */
export const IMAGEN_TEMA: Record<TemaId, string> = {
  pagos_instantaneos: '/temas/pagos_instantaneos.jpg',
  open_finance: '/temas/open_finance.jpg',
  stablecoins: '/temas/stablecoins.jpg',
  ia_aplicada: '/temas/ia_aplicada.jpg',
};

export const CREDITOS_UNSPLASH = [
  { autor: 'Jonas Leupe', url: 'https://unsplash.com/photos/0IVop5v4MMU' },
  { autor: 'Conny Schneider', url: 'https://unsplash.com/photos/xuTJZ7uD7PI' },
  { autor: 'Traxer', url: 'https://unsplash.com/photos/kM6QNrgo0YE' },
  { autor: 'Growtika', url: 'https://unsplash.com/photos/nGoCBxiaRO0' },
];

/** "Hash" corto y estable para mostrar en cada bloque de la cadena. */
export function hashCorto(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `#${(h >>> 0).toString(16).padStart(8, '0').slice(0, 4)}`;
}

/** Primera portada disponible entre las fuentes de una tendencia. */
export function portadaDeTendencia(t: Tendencia, portadas: Record<string, string>): string | undefined {
  return t.fuentes.map((f) => portadas[f.url]).find(Boolean);
}

/** Pedazo de texto: plano o resaltado como tema / estado / dato. */
export type Trozo =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'tema'; texto: string; tema: TemaId }
  | { tipo: 'estado'; texto: string; estado: Exclude<Estado, null> }
  | { tipo: 'dato'; texto: string };

/** Qué implica cada horizonte, para explicarlo al elegirlo. */
export const DESCRIPCION_HORIZONTE: Record<'corto' | 'mediano' | 'largo', string> = {
  corto: 'Lo que se espera en los próximos 0 a 1 año',
  mediano: 'Lo que se espera dentro de 1 a 3 años',
  largo: 'Lo que se espera dentro de 3 a 10 años',
};

const TEMAS_RE: [RegExp, TemaId][] = [
  [/pagos instant[aá]neos|transferencias? inmediatas?|pix\b/i, 'pagos_instantaneos'],
  [/open finance|finanzas abiertas|open banking/i, 'open_finance'],
  [/stablecoins?|usdt|usdc/i, 'stablecoins'],
  [/inteligencia artificial|\bIA\b|\bAI\b/, 'ia_aplicada'],
];

/** Parte un texto libre (resumen) y marca temas, estados, países y cifras. */
export function resaltar(texto: string): Trozo[] {
  const patron =
    /(pagos instant[aá]neos|transferencias? inmediatas?|\bpix\b|open finance|finanzas abiertas|open banking|stablecoins?|\busdt\b|\busdc\b|inteligencia artificial|\bIA\b|\bAI\b|atrasad[ao]s?|adelantad[ao]s?|parej[ao]s?|Argentina|Brasil|México|EE\.?\s?UU\.?|Estados Unidos|Europa|Uni[oó]n Europea|BCRA|US\$\s?[\d.,]+(?:\s?(?:millones|mil millones))?|\$\s?[\d.,]+(?:\s?(?:millones|mil millones))?|\d+(?:[.,]\d+)?\s?%|\b\d{1,3}(?:[.,]\d{3})+\b|\b\d+(?:[.,]\d+)?\s?(?:millones|mil millones)\b)/gi;
  const out: Trozo[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(patron)) {
    const i = m.index ?? 0;
    if (i > ultimo) out.push({ tipo: 'texto', texto: texto.slice(ultimo, i) });
    const s = m[0];
    const tema = TEMAS_RE.find(([re]) => re.test(s))?.[1];
    const low = s.toLowerCase();
    if (tema) out.push({ tipo: 'tema', texto: s, tema });
    else if (low.startsWith('atrasad')) out.push({ tipo: 'estado', texto: s, estado: 'atrasada' });
    else if (low.startsWith('adelantad')) out.push({ tipo: 'estado', texto: s, estado: 'adelantada' });
    else if (low.startsWith('parej')) out.push({ tipo: 'estado', texto: s, estado: 'pareja' });
    else out.push({ tipo: 'dato', texto: s });
    ultimo = i + s.length;
  }
  if (ultimo < texto.length) out.push({ tipo: 'texto', texto: texto.slice(ultimo) });
  return out;
}
