// Cálculo de brechas del Radar Fintech.
// Este mismo código se pega en el nodo Code "Calcular brechas" del flujo "Radar · 2 Consolidar".

/** Nivel de una columna con dos países (Brasil/México o EE.UU./UE): el más alto conocido. */
export function nivelColumna(niveles) {
  const conocidos = niveles.filter((n) => n !== null && n !== undefined);
  return conocidos.length ? Math.max(...conocidos) : null;
}

/** Brecha = nivel Argentina − nivel referencia. Null si falta alguno. */
export function brecha(ar, ref) {
  if (ar === null || ar === undefined || ref === null || ref === undefined) return null;
  return ar - ref;
}

/** Etiqueta de la brecha. */
export function estado(b) {
  if (b === null || b === undefined) return null;
  if (b < 0) return 'atrasada';
  if (b === 0) return 'pareja';
  return 'adelantada';
}

/** Nivel de una celda: primero el dato duro; si no, la moda de las fichas (empate: el menor). */
export function nivelCelda(datoDuro, fichas) {
  if (datoDuro !== null && datoDuro !== undefined) return { adopcion: datoDuro, origen: 'dato_duro' };
  if (!fichas.length) return { adopcion: null, origen: 'sin_datos' };
  const cuenta = new Map();
  for (const n of fichas) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  let mejor = null;
  for (const [nivel, veces] of cuenta) {
    if (mejor === null || veces > cuenta.get(mejor) || (veces === cuenta.get(mejor) && nivel < mejor)) mejor = nivel;
  }
  return { adopcion: mejor, origen: 'estimado' };
}
