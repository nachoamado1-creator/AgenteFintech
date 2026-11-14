// Descarga la última corrida desde n8n, la valida contra el contrato y la guarda como respaldo del dashboard.
// Uso:  RADAR_API_URL=https://... node scripts/exportar-corrida.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.RADAR_API_URL;
if (!url) {
  console.error('Falta la variable RADAR_API_URL (la URL del webhook de n8n).');
  process.exit(1);
}

const respuesta = await fetch(url);
if (!respuesta.ok) {
  console.error(`El webhook respondió ${respuesta.status}.`);
  process.exit(1);
}
const datos = await respuesta.json();

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validar = ajv.compile(JSON.parse(readFileSync(join(raiz, 'contract', 'radar.schema.json'), 'utf8')));
if (!validar(datos)) {
  console.error('La respuesta no cumple el contrato:', JSON.stringify(validar.errors, null, 2));
  process.exit(1);
}

const destino = join(raiz, 'dashboard', 'data', 'ultima-corrida.json');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify(datos, null, 2));
console.log(`Guardado ${destino} (corrida ${datos.corrida}, ${datos.totales.noticias} noticias de ${datos.totales.fuentes} fuentes).`);

// Historial de ediciones para el selector del dashboard: una por día, la más nueva primero.
const archivoEdiciones = join(raiz, 'dashboard', 'data', 'ediciones.json');
let ediciones = [];
try { ediciones = JSON.parse(readFileSync(archivoEdiciones, 'utf8')); } catch { /* primera vez */ }
ediciones = ediciones.filter((e) => e.corrida !== datos.corrida);
ediciones.push(datos);
ediciones.sort((a, b) => (a.corrida < b.corrida ? 1 : -1));
writeFileSync(archivoEdiciones, JSON.stringify(ediciones, null, 2));
console.log(`Ediciones guardadas: ${ediciones.map((e) => e.corrida).join(', ')}.`);
