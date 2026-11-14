# Radar Fintech: estado al 14/11/2026

TP de facultad. Agente en n8n Cloud que lee noticias de pagos y billeteras en Argentina, las compara con Brasil/México y EE.UU./Europa, y un dashboard en Vercel que muestra brechas por tema y horizonte.

Diseño aprobado: `docs/superpowers/specs/2026-11-13-radar-fintech-design.md`. Plan: `docs/superpowers/plans/2026-11-13-radar-fintech.md`. Rediseño de la pantalla: `specs/rediseno-dashboard.md`. Estética: `docs/diseno/estetica.md`.

## Hecho
- Contrato de datos `contract/radar.schema.json` con pruebas. Copia para el dashboard en `dashboard/data/radar.schema.json` (una prueba verifica que sean iguales).
- 17 filas de datos oficiales en n8n (`n8n/referencia.csv`) y metodología en `contract/metodologia.md`.
- Tres flujos en n8n (https://nachoamado.app.n8n.cloud), los tres **publicados**:
  - `Radar · 1 Recolectar y extraer` (id 2y5mkfxoMD1VemVs): corre solo **los martes a las 8:00** (hora de Buenos Aires) y también a mano. Lee 11 feeds, filtra, la IA arma una ficha por noticia (máx. 20 por corrida). Espera 1 minuto y llama al flujo 2.
  - `Radar · 2 Consolidar y calcular brechas` (id P1KFLZbt5Sr6mx2I): calcula celdas y brechas, la IA agrupa tendencias y resume cada tema. Si la IA falla usa `radar_resumenes_respaldo` y marca la corrida `provisorio: true`.
  - `Radar · 3 API de lectura` (id EmO4esfVuilZDqim): GET https://nachoamado.app.n8n.cloud/webhook/radar-fintech devuelve la última corrida en JSON.
- Modelos: Gemini `models/gemini-3.5-flash-lite` (credencial 7gJHTGCRgGT3ie9y, 500 consultas por día) como principal y Groq `openai/gpt-oss-120b` (credencial "Groq account", K2eVbtSlZEFzZbTH) de respaldo, en los dos flujos.
- Tablas de datos (proyecto personal gDY8VtSN7wH8BZ1B): radar_referencia wWoU7EXo9NWeeFbp, radar_fichas VWc43R4VMHkpqCgJ, radar_resultado 6X2VeZeyFdZbsKEN, radar_corridas 88OYMb2LZCDUDkb9, radar_resumenes_respaldo FQDKrWAV5lOEBuXu.
- Corrida real con IA del 14/11 (no provisoria): 75 noticias, 42 fuentes, 19 tendencias.
- Dashboard Next.js 16 en `dashboard/`, con la disposición de `specs/rediseno-dashboard.md`. Lee el agente en vivo (`RADAR_API_URL`, en `dashboard/.env.local` para uso local) y suma las ediciones guardadas en `dashboard/data/ediciones.json`. 31 pruebas en verde (`npm test` en la raíz).
- Scripts: `scripts/exportar-corrida.mjs` (baja la API, valida y guarda `ultima-corrida.json` y agrega la edición a `ediciones.json`; usa `RADAR_API_URL`), `scripts/maqueta-real.mjs`.

## Pendiente, en este orden
1. **Publicar** (tarea 8): subir el repo a GitHub del usuario, importarlo en Vercel con carpeta raíz `dashboard` y la variable `RADAR_API_URL` apuntando al webhook. README en español.
2. **Informe y video** (los entrega el grupo). Limitaciones: la búsqueda web de Brave está sin créditos, WEF bloquea la lectura automática (403), una corrida trae como máximo 20 noticias, la fecha de la edición se toma en hora universal (una corrida de noche en Argentina sale con el día siguiente).
3. Revisar textos de la IA antes del informe (en open finance escribió "adopción temprana (nivel 1)", y el nivel 1 es "pilotos").
4. Revisar 5 filas de datos oficiales que vienen de notas de prensa y no del documento original: open finance Brasil y México, IA Argentina y Brasil, y las stablecoins de Argentina y Brasil (datos 2023-24).

## Reglas que pidió el usuario
- Mantenerlo simple: es un TP. No sumar extras ni tocar n8n sin que lo pida.
- Uso liviano de la IA: corrida semanal automática (martes 8:00), máximo 20 noticias, pausas entre llamadas.
- Solo APIs gratuitas. La clave nunca se comparte en el chat: la crea el usuario en n8n y el asistente solo elige la credencial.
- Español rioplatense, sin tecnicismos: el grupo no programa.
