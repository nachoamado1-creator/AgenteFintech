// @vitest-environment node
import { describe, it, expect } from 'vitest';
import respaldo from '../data/ultima-corrida.json';
import type { Corrida } from './tipos';
import { tendenciasDe, textoEstado, dominio, fechaCorta, puntoArco, claveTendencia, puntosRadar, TEMAS, BORDE_HORIZONTE } from './vista';

const corrida = respaldo as unknown as Corrida;

describe('vista', () => {
  it('filters trends by horizon', () => {
    const corto = tendenciasDe(corrida, 'corto');
    expect(corto.every((t) => t.horizonte_ar === 'corto')).toBe(true);
    const total = (['corto', 'mediano', 'largo'] as const).reduce((n, h) => n + tendenciasDe(corrida, h).length, 0);
    expect(total).toBe(corrida.tendencias.length);
  });

  it('places every trend on the radar inside its topic quadrant and horizon band', () => {
    const puntos = puntosRadar(corrida.tendencias);
    expect(puntos).toHaveLength(corrida.tendencias.length);
    expect(new Set(puntos.map((p) => `${p.x},${p.y}`)).size).toBe(puntos.length);
    for (const p of puntos) {
      const cuadrante = TEMAS.indexOf(p.tendencia.tema);
      expect(p.angulo).toBeGreaterThan(cuadrante * 90);
      expect(p.angulo).toBeLessThan((cuadrante + 1) * 90);
      const distancia = Math.hypot(p.x - 200, p.y - 200);
      const h = p.tendencia.horizonte_ar;
      const interior = h === 'corto' ? 0 : BORDE_HORIZONTE[h === 'mediano' ? 'corto' : 'mediano'];
      expect(distancia).toBeGreaterThan(interior);
      expect(distancia).toBeLessThan(BORDE_HORIZONTE[h]);
    }
    expect(puntosRadar([])).toEqual([]);
  });

  it('formats gap labels and domains', () => {
    expect(textoEstado('atrasada', -2)).toBe('Atrasada −2');
    expect(textoEstado('pareja', 0)).toBe('Pareja');
    expect(textoEstado(null, null)).toBe('Sin datos');
    expect(dominio('https://www.bcra.gob.ar/x')).toBe('bcra.gob.ar');
  });

  it('formats the edition date without dots', () => {
    expect(fechaCorta('2026-11-13')).toMatch(/^13 nov 2026$/);
  });

  it('places gauge levels from left (0) to right (3)', () => {
    const cero = puntoArco(0, 100, 150, 150);
    const tres = puntoArco(3, 100, 150, 150);
    const medio = puntoArco(1.5, 100, 150, 150);
    expect(cero.x).toBeCloseTo(50);
    expect(tres.x).toBeCloseTo(250);
    expect(medio.y).toBeCloseTo(50);
  });

  it('builds a stable trend key', () => {
    expect(claveTendencia({ tema: 'stablecoins', nombre: 'X' })).toBe('stablecoins|X');
  });
});

import guardadas from '../data/ediciones.json';
import { conFuentesPorAlcance, alcanceDe } from './vista';

describe('fuentes por alcance', () => {
  it('classifies sources by scope', () => {
    expect(alcanceDe({ url: 'https://www.iproup.com/x', fuente: 'iProUP' })).toBe('AR');
    expect(alcanceDe({ url: 'https://finsidersbrasil.com.br/x', fuente: 'Finsiders Brasil' })).toBe('region');
    expect(alcanceDe({ url: 'https://www.bis.org/x', fuente: 'BIS' })).toBe('mundo');
  });

  it('gives every trend at least one Argentine, one regional and one global source', () => {
    for (const c of guardadas as unknown as Corrida[]) {
      for (const t of conFuentesPorAlcance(c).tendencias) {
        const alcances = new Set(t.fuentes.map((f) => f.alcance));
        expect([...alcances].sort(), `${c.corrida} · ${t.nombre}`).toEqual(['AR', 'mundo', 'region']);
        expect(new Set(t.fuentes.map((f) => f.url)).size).toBe(t.fuentes.length);
      }
    }
  });
});

import { fuentesDelTema } from './vista';
describe('fuentes de la tarjeta', () => {
  it('each topic card has an Argentine, a regional and a global source', () => {
    for (const c of guardadas as unknown as Corrida[]) for (const t of TEMAS) {
      const fs = fuentesDelTema(c, t);
      expect(fs.slice(0, 3).map((f) => f.alcance), `${c.corrida} · ${t}`).toEqual(['AR', 'region', 'mundo']);
      expect(fs.length).toBeGreaterThan(3);
      expect(fs.length).toBeLessThanOrEqual(7);
      expect(new Set(fs.map((f) => f.url)).size).toBe(fs.length);
    }
  });
});
