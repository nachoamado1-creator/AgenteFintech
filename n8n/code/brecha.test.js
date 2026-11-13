import { describe, it, expect } from 'vitest';
import { nivelColumna, brecha, estado, nivelCelda } from './brecha.js';

describe('cálculo de brechas', () => {
  it('nivelColumna toma el más alto', () => expect(nivelColumna([2, 3])).toBe(3));
  it('nivelColumna sin datos es null', () => expect(nivelColumna([null, null])).toBe(null));
  it('nivelColumna ignora null', () => expect(nivelColumna([null, 1])).toBe(1));
  it('brecha AR menos referencia', () => expect(brecha(0, 2)).toBe(-2));
  it('brecha con null es null', () => expect(brecha(null, 2)).toBe(null));
  it('estado atrasada', () => expect(estado(-2)).toBe('atrasada'));
  it('estado pareja', () => expect(estado(0)).toBe('pareja'));
  it('estado adelantada', () => expect(estado(1)).toBe('adelantada'));
  it('estado null', () => expect(estado(null)).toBe(null));
  it('nivelCelda usa la moda de fichas', () =>
    expect(nivelCelda(null, [1, 2, 2])).toEqual({ adopcion: 2, origen: 'estimado' }));
  it('nivelCelda empate va al menor', () =>
    expect(nivelCelda(null, [1, 2])).toEqual({ adopcion: 1, origen: 'estimado' }));
  it('nivelCelda prioriza dato duro', () =>
    expect(nivelCelda(3, [1])).toEqual({ adopcion: 3, origen: 'dato_duro' }));
  it('nivelCelda sin nada es sin_datos', () =>
    expect(nivelCelda(null, [])).toEqual({ adopcion: null, origen: 'sin_datos' }));
});
