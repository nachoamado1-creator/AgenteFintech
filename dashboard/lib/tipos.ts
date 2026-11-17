export type TemaId = 'pagos_instantaneos' | 'open_finance' | 'stablecoins' | 'ia_aplicada';
export type RegionCelda = 'AR' | 'LATAM' | 'GLOBAL';
export type Horizonte = 'corto' | 'mediano' | 'largo';
export type Capacidad = 'grande' | 'chica' | 'ambas';
export type Estado = 'atrasada' | 'pareja' | 'adelantada' | null;

export type Alcance = 'AR' | 'region' | 'mundo';
export interface Fuente { url: string; fuente: string; fecha: string; cita?: string; alcance?: Alcance; contexto?: boolean }
export interface Celda { tema: TemaId; region: RegionCelda; adopcion: 0 | 1 | 2 | 3 | null; origen: 'dato_duro' | 'estimado' | 'sin_datos'; urls: string[] }
export interface Tema {
  tema: TemaId; brecha_regional: number | null; brecha_global: number | null;
  estado_regional: Estado; estado_global: Estado; resumen: string; horizonte_ar: Horizonte;
  proveedores: string; inversion: string; indicadores: string[];
}
export interface Tendencia { tema: TemaId; nombre: string; horizonte_ar: Horizonte; capacidad: Capacidad; resumen: string; fuentes: Fuente[] }
export interface Referencia { tema: TemaId; region: 'AR' | 'BR' | 'MX' | 'US' | 'EU'; valor: string; que_mide: string; anio: number; nivel: number; justificacion: string; url: string }
export interface Corrida {
  ejemplo?: boolean; provisorio?: boolean; corrida: string; generado: string;
  totales: { noticias: number; fuentes: number; fuentes_fallidas: string[] };
  celdas: Celda[]; temas: Tema[]; tendencias: Tendencia[]; referencia: Referencia[];
}
