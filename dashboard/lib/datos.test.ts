// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import ejemplo from '../../contract/ejemplo-corrida.json';
import { obtenerCorrida, obtenerEdiciones, unaPorDia } from './datos';
import type { Corrida } from './tipos';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('obtenerCorrida', () => {
  it('returns en_vivo when the API responds with a valid run', async () => {
    vi.stubEnv('RADAR_API_URL', 'https://n8n.test/webhook/radar-fintech');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ejemplo }));
    const r = await obtenerCorrida();
    expect(r.origen).toBe('en_vivo');
    expect(r.corrida.corrida).toBe(ejemplo.corrida);
  });

  it('returns respaldo when fetch throws', async () => {
    vi.stubEnv('RADAR_API_URL', 'https://n8n.test/webhook/radar-fintech');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));
    const r = await obtenerCorrida();
    expect(r.origen).toBe('respaldo');
    expect(r.corrida.celdas.length).toBeGreaterThan(0);
  });

  it('returns respaldo when the API returns JSON that fails the schema', async () => {
    vi.stubEnv('RADAR_API_URL', 'https://n8n.test/webhook/radar-fintech');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ hola: 'mundo' }) }));
    expect((await obtenerCorrida()).origen).toBe('respaldo');
  });

  it('returns respaldo when RADAR_API_URL is not set', async () => {
    vi.stubEnv('RADAR_API_URL', '');
    expect((await obtenerCorrida()).origen).toBe('respaldo');
  });
});

describe('ediciones', () => {
  const c = (corrida: string, generado: string) => ({ ...ejemplo, corrida, generado }) as unknown as Corrida;

  it('keeps one edition per day, the latest generated, newest first', () => {
    const r = unaPorDia([c('2026-11-13', '2026-11-13T10:00:00Z'), c('2026-11-17', '2026-11-17T09:00:00Z'), c('2026-11-13', '2026-11-13T22:00:00Z')]);
    expect(r.map((x) => x.corrida)).toEqual(['2026-11-17', '2026-11-13']);
    expect(r[1].generado).toBe('2026-11-13T22:00:00Z');
  });

  it('adds the live run on top of the saved editions', async () => {
    vi.stubEnv('RADAR_API_URL', 'https://n8n.test/webhook/radar-fintech');
    const vivo = { ...ejemplo, corrida: '2099-01-01', generado: '2099-01-01T00:00:00Z' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => vivo }));
    const r = await obtenerEdiciones();
    expect(r.origen).toBe('en_vivo');
    expect(r.ediciones[0].corrida).toBe('2099-01-01');
    expect(r.ediciones.length).toBeGreaterThan(1);
  });

  it('falls back to the saved editions when the agent fails', async () => {
    vi.stubEnv('RADAR_API_URL', '');
    const r = await obtenerEdiciones();
    expect(r.origen).toBe('respaldo');
    expect(r.ediciones.length).toBeGreaterThan(0);
  });
});
