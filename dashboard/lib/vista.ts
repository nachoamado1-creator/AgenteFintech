import type { Capacidad, Celda, Corrida, Estado, Horizonte, RegionCelda, TemaId, Tendencia } from './tipos';

export const NOMBRE_TEMA: Record<TemaId, string> = {
  pagos_instantaneos: 'Pagos instantáneos',
  open_finance: 'Open finance',
  stablecoins: 'Stablecoins',
  ia_aplicada: 'IA aplicada',
};

/** Etiquetas cortas para el selector de tema (entran en celular). */
export const NOMBRE_TEMA_CORTO: Record<TemaId, string> = {
  pagos_instantaneos: 'Pagos',
  open_finance: 'Open finance',
  stablecoins: 'Stablecoins',
  ia_aplicada: 'IA',
};

export const TEMAS: TemaId[] = ['pagos_instantaneos', 'open_finance', 'stablecoins', 'ia_aplicada'];

export const NOMBRE_REGION: Record<RegionCelda, string> = {
  AR: 'Argentina',
  LATAM: 'Brasil / México',
  GLOBAL: 'EE.UU. / UE',
};

export const NOMBRE_NIVEL = ['Nada', 'Pilotos', 'Adopción temprana', 'Mayoría'] as const;

export const HORIZONTES: { id: Horizonte; etiqueta: string; largo: string }[] = [
  { id: 'corto', etiqueta: '0 - 1 año', largo: 'Corto plazo' },
  { id: 'mediano', etiqueta: '1 - 3 años', largo: 'Mediano plazo' },
  { id: 'largo', etiqueta: '3 - 10 años', largo: 'Largo plazo' },
];

export const NOMBRE_CAPACIDAD: Record<Capacidad, string> = {
  grande: 'Empresa grande',
  chica: 'Empresa chica',
  ambas: 'Grande o chica',
};

/** Identifica una tendencia entre ediciones (el índice cambia de una edición a otra). */
export const claveTendencia = (t: Pick<Tendencia, 'tema' | 'nombre'>) => `${t.tema}|${t.nombre}`;

export function tendenciasDe(corrida: Corrida, horizonte: Horizonte): Tendencia[] {
  return corrida.tendencias.filter((t) => t.horizonte_ar === horizonte);
}

export function celdaDe(celdas: Celda[], tema: TemaId, region: RegionCelda): Celda | undefined {
  return celdas.find((c) => c.tema === tema && c.region === region);
}

export function textoEstado(estado: Estado, brecha: number | null): string {
  if (!estado) return 'Sin datos';
  const nombre = { atrasada: 'Atrasada', pareja: 'Pareja', adelantada: 'Adelantada' }[estado];
  if (brecha === null || brecha === 0) return nombre;
  return `${nombre} ${brecha > 0 ? '+' : '−'}${Math.abs(brecha)}`;
}

export function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function aFecha(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
}

export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(aFecha(iso));
}

/** "13 nov 2026", para el selector de ediciones. */
export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(aFecha(iso))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/** Radio medio de cada franja del radar (el centro es hoy; más afuera, más futuro). */
export const RADIO_HORIZONTE: Record<Horizonte, number> = { corto: 56, mediano: 100, largo: 148 };
/** Borde exterior de cada franja. */
export const BORDE_HORIZONTE: Record<Horizonte, number> = { corto: 78, mediano: 124, largo: 172 };

export interface PuntoRadar { tendencia: Tendencia; clave: string; angulo: number; x: number; y: number; tam: number }

/**
 * Ubica cada tendencia en el radar: un cuadrante por tema (en el orden de TEMAS, girando
 * como un reloj desde arriba) y una franja por horizonte. Las de un mismo cuadrante y franja
 * se reparten a lo ancho y se alternan un poco hacia adentro y afuera para no pisarse.
 */
export function puntosRadar(tendencias: Tendencia[], cx = 200, cy = 200): PuntoRadar[] {
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const puntos: PuntoRadar[] = [];
  TEMAS.forEach((tema, cuadrante) => {
    HORIZONTES.forEach(({ id }) => {
      const grupo = tendencias.filter((t) => t.tema === tema && t.horizonte_ar === id);
      grupo.forEach((t, k) => {
        const angulo = r2(cuadrante * 90 + (90 * (k + 1)) / (grupo.length + 1));
        const radio = RADIO_HORIZONTE[id] + (grupo.length > 1 ? (k % 2 ? 9 : -9) : 0);
        const rad = (angulo * Math.PI) / 180;
        puntos.push({
          tendencia: t,
          clave: claveTendencia(t),
          angulo,
          x: r2(cx + radio * Math.sin(rad)),
          y: r2(cy - radio * Math.cos(rad)),
          tam: r2(4.5 + Math.min(t.fuentes.length, 10) * 0.45),
        });
      });
    });
  });
  return puntos;
}

/**
 * Punto sobre el medidor semicircular: nivel 0 a la izquierda, nivel 3 a la derecha.
 * Devuelve coordenadas SVG (el eje y crece hacia abajo).
 */
export function puntoArco(nivel: number, radio: number, cx: number, cy: number) {
  const angulo = Math.PI - (Math.min(Math.max(nivel, 0), 3) / 3) * Math.PI;
  // Redondeo a 2 decimales: el servidor y el navegador calculan el seno con distinta precisión.
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return { x: r2(cx + radio * Math.cos(angulo)), y: r2(cy - radio * Math.sin(angulo)) };
}
