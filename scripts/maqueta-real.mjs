// Genera una maqueta HTML del dashboard (opción B) con los datos reales de la última corrida.
// Uso: node scripts/maqueta-real.mjs <archivo-de-salida.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = process.argv[2];
if (!salida) { console.error('Falta el archivo de salida.'); process.exit(1); }
const d = JSON.parse(readFileSync(join(raiz, 'dashboard', 'data', 'ultima-corrida.json'), 'utf8'));

const NOMBRE = { pagos_instantaneos: 'Pagos instantáneos y QR', open_finance: 'Open finance', stablecoins: 'Stablecoins', ia_aplicada: 'IA aplicada' };
const NIVEL = ['Nada', 'Pilotos', 'Adopción temprana', 'Mayoría'];
const CLASE = ['c0', 'c1', 'c2', 'c3'];
const ETQ = { atrasada: ['t-red', 'Atrasada'], pareja: ['t-yel', 'Pareja'], adelantada: ['t-green', 'Adelantada'] };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const etiqueta = e => (e ? `<span class="rf-tag ${ETQ[e][0]}">${ETQ[e][1]}</span>` : '<span class="rf-tag t-gray">Sin datos</span>');
const celda = (t, r) => {
  const c = d.celdas.find(x => x.tema === t && x.region === r);
  if (!c || c.adopcion === null) return '<span class="rf-cell cn">Sin datos</span>';
  return `<span class="rf-cell ${CLASE[c.adopcion]}">${NIVEL[c.adopcion]}<small>${c.origen === 'dato_duro' ? 'dato oficial' : 'según noticias'}</small></span>`;
};

const filas = d.temas.map(t => `
  <span class="rf-tema">${NOMBRE[t.tema]}</span>${celda(t.tema, 'AR')}${celda(t.tema, 'LATAM')}${celda(t.tema, 'GLOBAL')}
  <span class="rf-tags"><span class="mini">vs región</span> ${etiqueta(t.estado_regional)}<br><span class="mini">vs EE.UU./UE</span> ${etiqueta(t.estado_global)}</span>`).join('');

const carril = (h, titulo) => `<div class="rf-lane"><b>${titulo}</b>${d.tendencias.filter(x => x.horizonte_ar === h).map(x =>
  `<div class="${x.capacidad === 'grande' ? 'grande' : ''}"><i>${NOMBRE[x.tema]}</i>${esc(x.nombre)}</div>`).join('')}</div>`;

const ej = d.temas.find(t => t.tema === 'open_finance');
const tendEj = d.tendencias.find(t => t.tema === 'open_finance');
const fuentesEj = (tendEj ? tendEj.fuentes : []).slice(0, 4).map(f => `<div class="rf-src">${esc(f.fuente)} · ${esc(f.fecha)} — ${esc(f.url.replace(/^https?:\/\//, '').slice(0, 58))}…</div>`).join('');

const html = `<style>
  .rf{font-family:'Helvetica Neue','Geist Sans',system-ui,sans-serif}
  .rf .serif{font-family:'Newsreader','Instrument Serif',Georgia,serif;letter-spacing:-0.02em;line-height:1.1}
  .rf-win{background:#FBFBFA;border:1px solid #EAEAEA;border-radius:10px;overflow:hidden;color:#2F3437;font-size:13px}
  .rf-bar{background:#fff;border-bottom:1px solid #EAEAEA;padding:8px 12px;display:flex;gap:6px}
  .rf-dot{width:9px;height:9px;border-radius:50%;background:#E3E2DE}
  .rf-body{padding:20px 22px}
  .rf-h{font-size:28px;margin:0 0 4px;color:#111}
  .rf-sub{color:#787774;font-size:12px;margin-bottom:12px}
  .rf-aviso{background:#FBF3DB;color:#956400;border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:16px}
  .rf-chips{display:flex;gap:8px;align-items:center;margin-bottom:16px;font-size:12px;color:#787774}
  .rf-chip{border:1px solid #EAEAEA;background:#fff;border-radius:6px;padding:4px 10px;color:#2F3437}
  .rf-chip.on{background:#111;color:#fff;border-color:#111}
  .rf-cols{display:grid;grid-template-columns:1.7fr 1fr}
  .rf-grid{display:grid;grid-template-columns:140px repeat(3,1fr) 130px;gap:6px;align-items:center}
  .rf-grid .hd{color:#787774;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
  .rf-tema{font-weight:600;color:#111}
  .rf-cell{border-radius:6px;padding:8px 6px;text-align:center;font-size:12px;font-weight:600}
  .rf-cell small{display:block;font-weight:400;font-size:9.5px;opacity:.75;margin-top:2px}
  .c0{background:#FDEBEC;color:#9F2F2D}.c1{background:#FBF3DB;color:#956400}.c2{background:#E1F3FE;color:#1F6C9F}.c3{background:#EDF3EC;color:#346538}.cn{background:#F1F1EF;color:#787774}
  .rf-tag{display:inline-block;border-radius:9999px;padding:2px 8px;font-size:9px;letter-spacing:.05em;text-transform:uppercase;font-weight:600}
  .t-red{background:#FDEBEC;color:#9F2F2D}.t-yel{background:#FBF3DB;color:#956400}.t-green{background:#EDF3EC;color:#346538}.t-gray{background:#F1F1EF;color:#787774}
  .mini{font-size:9.5px;color:#787774}
  .rf-tags{line-height:1.9}
  .rf-lanes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
  .rf-lane{border-top:2px solid #111;padding-top:8px}
  .rf-lane>b{font-size:12px;color:#111}
  .rf-lane div{background:#fff;border:1px solid #EAEAEA;border-radius:6px;padding:6px 8px;margin-top:6px;font-size:11.5px}
  .rf-lane div.grande{border-style:dashed}
  .rf-lane i{display:block;font-style:normal;font-size:9px;text-transform:uppercase;letter-spacing:.05em;color:#787774;margin-bottom:2px}
  .rf-card{background:#fff;border:1px solid #EAEAEA;border-radius:8px;padding:14px;margin-left:18px}
  .rf-card h4{margin:6px 0 4px;color:#111;font-size:15px}
  .rf-card p{margin:0 0 8px;font-size:12px;line-height:1.5}
  .rf-card .k{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#787774;margin-top:8px}
  .rf-src{font-size:10.5px;color:#1F6C9F;text-decoration:underline;margin-top:3px}
  .leyenda{margin-top:14px;font-size:10.5px;color:#787774}
</style>
<h2>Así se ve con los datos reales</h2>
<p class="subtitle">Opción B con la última corrida (13/11/2026). Los niveles, brechas, tendencias y links son reales; los resúmenes son provisorios. Decime qué cambiarías de estética.</p>
<div class="rf"><div class="rf-win">
 <div class="rf-bar"><i class="rf-dot"></i><i class="rf-dot"></i><i class="rf-dot"></i></div>
 <div class="rf-body">
  <p class="rf-h serif">Radar Fintech · Pagos y billeteras en Argentina</p>
  <div class="rf-sub">Última corrida ${esc(d.corrida)} · ${d.totales.noticias} noticias de ${d.totales.fuentes} fuentes · ${d.tendencias.length} tendencias</div>
  ${d.provisorio ? '<div class="rf-aviso">Los resúmenes por tema son provisorios: se redactaron a partir de las noticias reales mientras el agente no tenía IA disponible. Las celdas, brechas y links sí son del agente.</div>' : ''}
  <div class="rf-chips">Tipo de empresa: <span class="rf-chip on">Todas</span><span class="rf-chip">Grande</span><span class="rf-chip">Chica</span></div>
  <div class="rf-cols">
   <div>
    <div class="rf-grid">
     <span></span><span class="hd">Argentina</span><span class="hd">Brasil / México</span><span class="hd">EE.UU. / Europa</span><span class="hd">Brecha de Argentina</span>
     ${filas}
    </div>
    <div class="leyenda">Nivel de adopción: Nada · Pilotos · Adopción temprana · Mayoría. Click en una celda o tendencia para ver las fuentes.</div>
    <div class="rf-lanes">${carril('corto', 'Corto plazo · 0 a 1 año')}${carril('mediano', 'Mediano plazo · 1 a 3 años')}${carril('largo', 'Largo plazo · 3 a 10 años')}</div>
    <div class="leyenda">Borde punteado: requiere capacidad de empresa grande.</div>
   </div>
   <div class="rf-card">
    ${etiqueta(ej.estado_regional)} <span class="mini">Open finance · horizonte ${esc(ej.horizonte_ar)}</span>
    <h4>${NOMBRE.open_finance}</h4>
    <p>${esc(ej.resumen)}</p>
    <div class="k">Quién lo provee</div><p>${esc(ej.proveedores)}</p>
    <div class="k">Inversión y capacidad</div><p>${esc(ej.inversion)}</p>
    <div class="k">Cómo medir el impacto</div><p>${ej.indicadores.map(esc).join(' · ')}</p>
    <div class="k">Fuentes</div>${fuentesEj}
   </div>
  </div>
 </div>
</div></div>`;

writeFileSync(salida, html);
console.log('Maqueta escrita en', salida, `(${html.length} caracteres)`);
