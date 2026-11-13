# Radar Fintech: estado al 13/11/2026

TP de facultad. Agente en n8n Cloud que lee noticias de pagos y billeteras en Argentina, las compara con Brasil/México y EE.UU./Europa, y un dashboard en Vercel que muestra brechas por tema y horizonte.

Diseño aprobado: `docs/superpowers/specs/2026-11-13-radar-fintech-design.md`. Plan: `docs/superpowers/plans/2026-11-13-radar-fintech.md`. Registro de decisiones del plan (no está en git, pero queda en esta carpeta): `.superpowers/sdd/2026-11-13-radar-fintech/progress.md`.

## Hecho (tareas 1 a 5 del plan, más la capa de datos de la tarea 6)
- Contrato de datos `contract/radar.schema.json` con pruebas. Copia para el dashboard en `dashboard/data/radar.schema.json` (una prueba verifica que sean iguales).
- 17 filas de datos oficiales en n8n (`n8n/referencia.csv`) y metodología en `contract/metodologia.md`.
- Tres flujos en n8n (https://nachoamado.app.n8n.cloud):
  - `Radar · 1 Recolectar y extraer` (id 2y5mkfxoMD1VemVs): lee 11 feeds, filtra, una IA arma una ficha por noticia (máx. 20 por corrida, una cada 7 s, reintentos). Al final llama al flujo 2.
  - `Radar · 2 Consolidar y calcular brechas` (id P1KFLZbt5Sr6mx2I): calcula celdas y brechas, la IA agrupa tendencias y resume cada tema. Si la IA falla usa `radar_resumenes_respaldo` y marca la corrida `provisorio: true`.
  - `Radar · 3 API de lectura` (id EmO4esfVuilZDqim, publicado): GET https://nachoamado.app.n8n.cloud/webhook/radar-fintech devuelve la última corrida en JSON.
- Tablas de datos (proyecto personal gDY8VtSN7wH8BZ1B): radar_referencia wWoU7EXo9NWeeFbp, radar_fichas VWc43R4VMHkpqCgJ, radar_resultado 6X2VeZeyFdZbsKEN, radar_corridas 88OYMb2LZCDUDkb9, radar_resumenes_respaldo FQDKrWAV5lOEBuXu.
- Datos reales cargados: 71 fichas con link, 12 celdas y 4 temas con brechas. Los resúmenes y las 20 tendencias de la última corrida son PROVISORIOS (los redactó el asistente a partir de las fichas reales porque se agotaron los créditos de IA). Una corrida real con IA los reemplaza.
- Dashboard: esqueleto Next.js 16 en `dashboard/` con `lib/datos.ts` (lee la API y cae a `dashboard/data/ultima-corrida.json` si falla). 23 pruebas en verde (`npm test` en la raíz).
- Scripts: `scripts/exportar-corrida.mjs` (baja la API, valida y guarda el respaldo; usa `RADAR_API_URL`), `scripts/maqueta-real.mjs` (maqueta HTML con datos reales).

## Pendiente, en este orden
1. **Estilo del dashboard.** El usuario dijo que la maqueta es "muy básica y genérica" y va a dar el estilo nuevo. Guardarlo en `docs/diseno/estetica.md` y recién después hacer la tarea 7 (pantalla: mapa de brechas, línea de tiempo, panel de detalle con fuentes, filtro grande/chica, página de metodología, aviso cuando la corrida es provisoria o viene del respaldo). Probar en celular (375 px).
2. **Modelo de IA.** El usuario ya creó la credencial de Groq en n8n (falta saber su nombre: buscar con list_credentials, tipo groqApi). Hacer que Gemini (credencial 7gJHTGCRgGT3ie9y, `models/gemini-3-flash-preview`) sea el modelo principal y Groq el de respaldo (opción "fallback model" del nodo Basic LLM Chain) en los dos flujos. Después correr el flujo 1 una vez, con cuota disponible, para reemplazar los resúmenes provisorios. El plan gratuito de Gemini se pasó del límite el 13/11 (error de demasiadas consultas); los límites reales están en el panel de AI Studio.
3. **Publicar** (tarea 8): subir el repo a GitHub del usuario, importarlo en Vercel con carpeta raíz `dashboard/` y la variable `RADAR_API_URL` apuntando al webhook; regenerar el respaldo con `scripts/exportar-corrida.mjs`; README en español.
4. **Informe y video** (los entrega el grupo). Anotar como limitaciones: la búsqueda web de Brave está sin créditos (los créditos de n8n son prepago y no se renuevan), WEF bloquea la lectura automática (403), muchas fuentes de Brave eran blogs poco conocidos, una corrida trae como máximo 20 noticias.
5. Revisar antes del informe 5 filas de datos oficiales que vienen de notas de prensa y no del documento original: open finance Brasil y México, IA Argentina y Brasil, y las stablecoins de Argentina y Brasil (datos 2023-24).

## Reglas que pidió el usuario
- Uso liviano: pocas noticias por corrida, pausas entre llamadas, el agente corre a pedido (no hay corrida semanal activada).
- Solo APIs gratuitas. La clave nunca se comparte en el chat: la crea el usuario en n8n y el asistente solo elige la credencial.
- Español rioplatense, sin tecnicismos: el grupo no programa.
