// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import ejemplo from '../../contract/ejemplo-corrida.json';
import { obtenerCorrida } from './datos';

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
