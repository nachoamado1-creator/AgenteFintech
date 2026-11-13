import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const aqui = dirname(fileURLToPath(import.meta.url));
const leer = (p: string) => JSON.parse(readFileSync(join(aqui, p), 'utf8'));

function validador() {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  return ajv.compile(leer('radar.schema.json'));
}

describe('contrato Corrida', () => {
  it('ejemplo-corrida.json is valid against radar.schema.json', () => {
    const validar = validador();
    const ok = validar(leer('ejemplo-corrida.json'));
    expect(validar.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('rejects a celda with adopcion 4', () => {
    const validar = validador();
    const datos = leer('ejemplo-corrida.json');
    datos.celdas[0].adopcion = 4;
    expect(validar(datos)).toBe(false);
  });

  it('rejects a tendencia without fuentes', () => {
    const validar = validador();
    const datos = leer('ejemplo-corrida.json');
    datos.tendencias[0].fuentes = [];
    expect(validar(datos)).toBe(false);
  });

  it('accepts the provisorio flag and rejects a non-boolean one', () => {
    const validar = validador();
    const datos = leer('ejemplo-corrida.json');
    datos.provisorio = true;
    expect(validar(datos)).toBe(true);
    datos.provisorio = 'si';
    expect(validar(datos)).toBe(false);
  });

  const snapshot = join(aqui, '..', 'dashboard', 'data', 'ultima-corrida.json');
  it.runIf(existsSync(snapshot))('ultima-corrida.json is valid', () => {
    const validar = validador();
    const ok = validar(JSON.parse(readFileSync(snapshot, 'utf8')));
    expect(validar.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });
});
