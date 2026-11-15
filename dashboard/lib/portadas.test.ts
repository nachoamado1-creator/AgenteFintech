import { describe, it, expect } from 'vitest';
import { extraerPortada } from './portadas';

describe('extraerPortada', () => {
  it('toma og:image', () => {
    const html = '<head><meta property="og:image" content="https://x.com/a.jpg"></head>';
    expect(extraerPortada(html, 'https://x.com/nota')).toBe('https://x.com/a.jpg');
  });

  it('acepta content antes de property y comillas simples', () => {
    const html = "<meta content='https://x.com/b.png' property='og:image'/>";
    expect(extraerPortada(html, 'https://x.com/nota')).toBe('https://x.com/b.png');
  });

  it('resuelve rutas relativas, pasa http a https y limpia &amp;', () => {
    expect(extraerPortada('<meta property="og:image" content="/img/c.jpg?a=1&amp;b=2">', 'https://x.com/nota'))
      .toBe('https://x.com/img/c.jpg?a=1&b=2');
    expect(extraerPortada('<meta property="og:image" content="http://x.com/d.jpg">', 'https://x.com/')).toBe('https://x.com/d.jpg');
  });

  it('cae en twitter:image y devuelve null si no hay nada', () => {
    expect(extraerPortada('<meta name="twitter:image" content="https://x.com/e.jpg">', 'https://x.com/')).toBe('https://x.com/e.jpg');
    expect(extraerPortada('<head><title>hola</title></head>', 'https://x.com/')).toBeNull();
  });
});
