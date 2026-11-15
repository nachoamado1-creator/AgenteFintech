# Radar Fintech: estado al 14/11/2026

TP de facultad. Agente en n8n Cloud que lee noticias de pagos y billeteras en Argentina, las compara con Brasil/México y EE.UU./Europa, y un dashboard en Vercel que muestra brechas por tema y horizonte.

Diseño aprobado: `docs/superpowers/specs/2026-11-13-radar-fintech-design.md`. Plan: `docs/superpowers/plans/2026-11-13-radar-fintech.md`. Rediseño de la pantalla: `specs/rediseno-dashboard.md`. Estética: `docs/diseno/estetica.md`.

## Hecho
- Contrato de datos `contract/radar.schema.json` con pruebas. Copia para el dashboard en `dashboard/data/radar.schema.json` (una prueba verifica que sean iguales).
- 17 filas de datos oficiales en n8n (`n8n/referencia.csv`) y metodología en `contract/metodologia.md`.
- Agente en n8n (https://nachoamado.app.n8n.cloud), reorganizado el 15/11 en **un solo flujo**:
  - `Radar · Agente (recolectar, clasificar y brechas)` (id 2y5mkfxoMD1VemVs): corre solo **los martes a las 8:00** (hora de Buenos Aires) y también a mano. Lee 11 feeds RSS y 4 consultas al RSS de Google Noticias (gratis) para los 8 foros de `Fuentes.md` y WEF, filtra por palabras de los 4 temas (español, inglés y portugués), elige noticias con cuotas por horizonte (14 corto, 10 mediano, 10 largo; máx. 4 por fuente), la IA clasifica de a 12 noticias por llamada, guarda las fichas, calcula celdas y brechas, resume los 4 temas de a uno con 30 s de espera antes de cada uno (para no pasar el límite de Groq) y guarda la corrida. Una corrida completa tarda unos 2 minutos y 45 segundos. Publicado el 15/11 (prueba ejecución 52: 4 de 4 resúmenes con IA, sin respaldo). Si la IA falla al resumir usa `radar_resumenes_respaldo` y marca la corrida `provisorio: true`. Lista de fuentes en `n8n/fuentes.md`.
  - `Radar · 3 API de lectura` (id EmO4esfVuilZDqim): GET https://nachoamado.app.n8n.cloud/webhook/radar-fintech devuelve la última corrida en JSON.
  - `Radar · 2 Consolidar y calcular brechas` (id P1KFLZbt5Sr6mx2I) **ya no se usa**: su lógica se copió al flujo único. Sigue publicado, se puede archivar.
- Modelo: solo Groq `openai/gpt-oss-120b` (credencial "Groq account", K2eVbtSlZEFzZbTH). Se sacó Gemini. `llama-3.1-8b-instant` dio "no encontrado" en esta cuenta. Brave Search se sacó porque se acabaron los créditos del gateway.
- Tablas de datos (proyecto personal gDY8VtSN7wH8BZ1B): radar_referencia wWoU7EXo9NWeeFbp, radar_fichas VWc43R4VMHkpqCgJ, radar_resultado 6X2VeZeyFdZbsKEN, radar_corridas 88OYMb2LZCDUDkb9, radar_resumenes_respaldo FQDKrWAV5lOEBuXu.
- Corrida real con IA del 14/11 (no provisoria, con la versión anterior del agente): 75 noticias, 42 fuentes, 19 tendencias. Las fichas viejas siguen en `radar_fichas` y por eso el total de fuentes del dashboard sigue alto (ahora la lista es cerrada).
- Dashboard Next.js 16 en `dashboard/`, con la disposición de `specs/rediseno-dashboard.md`. Lee el agente en vivo (`RADAR_API_URL`, en `dashboard/.env.local` para uso local) y suma las ediciones guardadas en `dashboard/data/ediciones.json`. 31 pruebas en verde (`npm test` en la raíz).
- Scripts: `scripts/exportar-corrida.mjs` (baja la API, valida y guarda `ultima-corrida.json` y agrega la edición a `ediciones.json`; usa `RADAR_API_URL`), `scripts/maqueta-real.mjs`.

- **Publicado** (verificado el 14/11): dashboard en https://agente-fintech.vercel.app/ y código en https://github.com/nachoamado1-creator/AgenteFintech.
- Borrador del informe en `Informe-Radar-Fintech.docx` (raíz). Tiene campos amarillos para completar y no se verificó el largo (máx. 5 páginas).

## Pendiente, en este orden
1. **README en español** del repo (el de `dashboard/` sigue siendo el de plantilla de Next.js).
2. **Informe y video** (los entrega el grupo). Completar los campos amarillos del borrador, agregar capturas, revisar que no pase de 5 páginas y poner el link del video. Limitaciones: Groq tiene tope de tokens por minuto, así que el resumen por tema puede caer al respaldo (corrida `provisorio`); el feed de Google Noticias es solo para uso personal y no comercial y sus links son redirecciones de Google; los foros publican pocas notas fuera de la fecha de su evento; una corrida procesa hasta 34 noticias nuevas; la fecha de la edición se toma en hora universal (una corrida de noche en Argentina sale con el día siguiente).
3. Revisar textos de la IA antes del informe (en open finance escribió "adopción temprana (nivel 1)", y el nivel 1 es "pilotos").
4. Revisar 5 filas de datos oficiales que vienen de notas de prensa y no del documento original: open finance Brasil y México, IA Argentina y Brasil, y las stablecoins de Argentina y Brasil (datos 2023-24).

## Reglas que pidió el usuario
- Mantenerlo simple: es un TP. No sumar extras ni tocar n8n sin que lo pida.
- Uso liviano de la IA: corrida semanal automática (martes 8:00), un solo flujo, que no tarde más de unos 2 minutos, sin tope artificial de noticias pero repartidas en corto, mediano y largo plazo.
- Solo Groq como modelo y solo APIs gratuitas. La clave nunca se comparte en el chat: la crea el usuario en n8n y el asistente solo elige la credencial.
- Fuentes: lista cerrada (13 medios y organismos + 8 foros de `Fuentes.md`), no traer decenas de dominios distintos.
- No hacer pruebas repetidas a ciegas ni esperas largas: diseñar completo, una prueba por cambio.
- Español rioplatense, sin tecnicismos: el grupo no programa.
