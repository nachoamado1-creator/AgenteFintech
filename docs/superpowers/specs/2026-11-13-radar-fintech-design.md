# Radar Fintech: diseño

Fecha: 13/11/2026. Estado: aprobado (13/11/2026).
Pantallas de referencia: `docs/diseno/flujo-agente.html` y `docs/diseno/maquetas-dashboard.html` (opción B).

## 1. Para qué es

Es un TP de facultad sobre la industria Fintech. Hay que entregar un agente de IA que monitorea la industria y un dashboard con URL pública que responda tres preguntas: qué pasa hoy, qué puede venir y dónde están las brechas. Se entregan además un informe de hasta 5 páginas y un video demo.

La nota pesa sobre todo en cuatro cosas: preguntas propias del sector (no tendencias genéricas), fuentes verificables, una separación clara entre el promedio actual y los horizontes, y brechas argumentadas, tanto donde la industria va atrasada como donde va adelantada.

El usuario es un grupo de estudiantes que no programa. Todo tiene que poder entenderse, mostrarse en el video y volver a ejecutarse sin tocar código.

## 2. Recorte y preguntas

**Segmento:** pagos y billeteras digitales en Argentina, comparados con la región (Brasil y México) y con EE.UU. y Europa.

**Cuatro temas, cada uno con su pregunta:**
1. **Pagos instantáneos y QR**: ¿cuánto reemplazan a la tarjeta y al efectivo?
2. **Open finance**: ¿cuándo llega a Argentina compartir datos financieros por API, y quién lo habilita?
3. **Stablecoins y cripto para pagos y remesas**: ¿quién lo ofrece, con qué regulación y cuánto se usa?
4. **IA aplicada**: fraude, scoring de crédito y pagos hechos por agentes de IA.

**Datos de cada tema:** quién provee la tecnología, qué inversión hace falta y qué capacidad financiera exige (solo una empresa grande, o también una chica), y 2 o 3 indicadores para medir el impacto.

**Horizontes:** corto de 0 a 1 año, mediano de 1 a 3 años, largo de 3 a 10 años.

**Escala de adopción** (la misma para todas las celdas): 0 Nada · 1 Pilotos · 2 Adopción temprana · 3 Mayoría.

**Brecha:** se mide sobre la escala de adopción.
- Brecha regional = nivel Argentina − nivel Brasil/México.
- Brecha global = nivel Argentina − nivel EE.UU./UE.
- Resultado: menor que 0 = **atrasada**, 0 = **pareja**, mayor que 0 = **adelantada**.

El argumento para el informe: lo que hoy es normal en un referente es una señal de lo que puede llegar a Argentina, y el horizonte estimado sale de esa distancia más la regulación local.

## 3. Enfoques considerados

| Enfoque | A favor | En contra |
|---|---|---|
| **n8n (agente) + dashboard web en Vercel**: elegido | El flujo se ve como diagrama, ideal para el video y el informe. Disparador programado incluido. n8n Cloud está siempre online. El dashboard sigue andando aunque falle n8n. | Dos piezas para mantener |
| Solo script de Python con GitHub Actions | Control total, gratis, sin servidor | Es código: cuesta mostrarlo y el grupo no lo puede tocar |
| Todo dentro de n8n, dashboard incluido | Una sola pieza | n8n no está hecho para dashboards visuales, y la claridad visual se evalúa |

Lo eligió el grupo, y elegido porque su n8n es Cloud.

## 4. Agente (n8n Cloud)

**Fuentes, con el horizonte que sugiere cada una.** La fuente es una pista para el modelo; el horizonte lo decide el modelo según el contenido.

| Rol | Fuentes | Cómo se leen |
|---|---|---|
| Corto | Fintech News LatAm/Global, iProUP Finanzas, Bloomberg Línea Fintech, Cámara Argentina de Fintech, LatamList, Finsiders Brasil | RSS; búsqueda web si no hay feed |
| Mediano | a16z Fintech, informe BID/Finnovista, Finnovista Fintech Radar | RSS / búsqueda web |
| Largo | BIS Innovation Hub, WEF Future of Financial Services, arXiv (q-fin, cs) | RSS / API de arXiv / búsqueda web |
| Datos duros (comparación entre países) | BIS Red Book (CPMI), BCRA (Informe de Pagos Minoristas, Informe de Inclusión Financiera), Banco Central de Brasil (Pix y Open Finance), Banco Mundial (Global Findex), BCE, informe ITBA/Cámara Fintech | Tabla de referencia cargada a mano con link de cada dato; se actualiza cuando sale un informe nuevo, no en cada corrida |

**Pasos** (cada uno es un grupo de nodos con nombre claro):
1. **Disparador:** todos los lunes, y también manual.
2. **Recolectar:** feeds y búsqueda web (Brave Search, con los créditos de n8n).
3. **Filtrar:** últimos 90 días, palabras clave de los 4 temas en español, portugués e inglés, y sin duplicados (mismo link o título casi igual).
4. **Extraer con IA:** Claude, con los créditos de n8n, con salida estructurada. Por cada noticia arma una ficha con tema, país/región, tendencia (una línea), nivel de adopción, horizonte para Argentina, proveedores, inversión y capacidad, indicador, link, fecha, fuente y una cita textual corta que respalde la clasificación. Si la noticia no corresponde a ningún tema, se descarta.
5. **Consolidar:** agrupa las fichas por tema y región. El nivel de cada celda sale del dato duro si existe; si no, del nivel más frecuente en las fichas, y en ese caso la celda se marca como "estimado por noticias". Calcula las brechas y le pide al modelo un resumen de 2 o 3 líneas por tema, citando las fichas.
6. **Guardar:** tablas de datos de n8n (estructura abajo), cada fila con el identificador y la fecha de la corrida.
7. **Publicar:** un webhook de n8n devuelve en JSON los datos de la última corrida.

**Límite por corrida:** como mucho unas 150 noticias, para no gastar todos los créditos.

**Estructura de los datos (ejemplo con valores inventados):**
```
fichas:   { corrida: "2026-11-16", tema: "open_finance", region: "BR", tendencia: "...",
            adopcion: 2, horizonte_ar: "mediano", proveedores: "Belvo, BCB",
            inversion: "...", indicador: "...", cita: "...",
            url: "https://...", fuente: "Finsiders Brasil", fecha: "2026-11-04" }
celdas:   { corrida, tema, region: "AR|LATAM|GLOBAL", adopcion: 0-3,
            origen: "dato_duro|estimado", urls: [...] }
temas:    { corrida, tema, brecha_regional, brecha_global, estado: "atrasada|pareja|adelantada",
            resumen, horizonte_ar, proveedores, inversion, indicadores }
referencia (datos duros, carga manual): { tema, region, valor, que_mide, anio, url }
```
Guardar siempre **qué mide** cada número. Las cifras de prensa suelen medir cosas distintas: personas que usaron algo frente a porcentaje del valor pagado.

## 5. Dashboard (opción B)

Una sola pantalla con lectura de un vistazo:
- **Arriba:** fecha de la última corrida y cantidad de fuentes leídas.
- **Mapa de brechas:** 4 temas × 3 regiones (Argentina, Brasil/México, EE.UU./UE). El color indica el nivel de adopción; cada tema lleva una etiqueta de atrasada, pareja o adelantada. Responde "¿qué pasa hoy?" y "¿dónde están las brechas?".
- **Línea de tiempo:** tres carriles (corto, mediano y largo) con las tendencias que llegarían a Argentina. Responde "¿qué puede venir?".
- **Panel de detalle:** al hacer click en una celda o una tendencia se ve el resumen, los proveedores, la inversión y la capacidad, los indicadores y la lista de fuentes con link y fecha.
- **Filtro por tipo de empresa** (grande o chica): cambia qué tendencias se marcan como viables según la capacidad de inversión.
- Una página o sección breve de "Metodología": fuentes, escala, horizontes y cómo se calcula la brecha.

**Estilo:** minimalista, en el estilo de las maquetas: fondo blanco hueso, bordes finos, colores pastel solo para los niveles. Las mejoras de estética que el grupo quiere proponer se ven aparte, antes de construir el dashboard.

**Tecnología** (decisión del asistente): app web publicada en Vercel con URL pública. Lee el webhook de n8n y guarda en caché la última respuesta buena, así que si n8n no responde muestra la última corrida con su fecha. El texto está en español y la pantalla se adapta al celular.

## 6. Fuera del alcance

- Monitorear una empresa puntual o países fuera de los tres grupos.
- Datos en tiempo real o actualizaciones de más de una por semana.
- Inicio de sesión o usuarios: el dashboard es público.
- Scraping de sitios que lo prohíben. Si una fuente no tiene feed ni aparece en la búsqueda, queda como limitación.

## 7. Cosas que harían fracasar el TP aunque "funcione"

- Celdas o tendencias sin link verificable.
- Tendencias genéricas ("la IA transforma las finanzas") sin vínculo con pagos en Argentina.
- Un dashboard que solo entiende quien lo programó.
- Un agente que no puede volver a correrse en el video.

## 8. Lo que queda a criterio de quien construye

- Nombres exactos de nodos y tablas, y el texto final de los prompts, siempre que respeten la estructura de arriba.
- Qué feeds RSS concretos existen hoy. Si una fuente no tiene feed, va por búsqueda web, y eso se anota.
- Los valores iniciales de la tabla de referencia, con fuentes reales y su link.

## 9. Decisiones de detalle (salieron de la revisión; las tomó el asistente)

1. **Dos etiquetas por tema, no una.** Una compara con la región y otra con EE.UU./UE (por ejemplo, open finance: "atrasada vs región" y "atrasada vs EE.UU./UE"). El campo `estado` se reemplaza por `estado_regional` y `estado_global`.
2. **Columna de dos países** (Brasil/México, EE.UU./UE): se toma el **nivel más alto** de los dos, porque representa lo que ya es posible en ese grupo. Las noticias de otros países se descartan en el filtro, salvo que traten una tendencia global (el modelo las marca con región `GLOBAL`).
3. **De dato duro a nivel 0 a 3:** cada fila de `referencia` lleva un campo `nivel` (0 a 3) cargado a mano y una justificación de una línea. Los cortes por tema se publican en la sección Metodología del dashboard; por ejemplo, para pagos instantáneos: 3 si más del 50% de los pagos sin efectivo son instantáneos.
4. **Tendencias de la línea de tiempo:** se agrega un paso entre Extraer y Consolidar. El modelo agrupa las fichas de cada tema en un máximo de 5 tendencias con nombre corto, horizonte, capacidad y la lista de fichas que la respaldan. Se guardan en una tabla nueva, `tendencias`: { corrida, tema, nombre, horizonte_ar, capacidad, resumen, fichas: [urls] }. Al hacer click en una tendencia se abre su detalle.
5. **Capacidad:** es un campo fijo, `capacidad: grande | chica | ambas`, en cada tendencia, y lo completa el modelo. El filtro "empresa chica" atenúa (no oculta) las tendencias marcadas como `grande`.
6. **Ventana de datos:** las celdas y las tendencias se calculan sobre todas las fichas de los últimos 90 días, no solo las de esta corrida. Se evitan duplicados con el link. Cada corrida reemplaza las tablas `celdas`, `temas` y `tendencias`; `fichas` se acumula. Una celda sin dato duro ni fichas muestra **"Sin datos"** en gris y no entra en el cálculo de la brecha.
7. **Lectura de noticias:** el modelo lee el título y el resumen del feed; la cita textual sale de ahí. El texto completo (Firecrawl) solo se busca para resultados de búsqueda web sin resumen. Modelo: Claude Sonnet con los créditos de n8n. El saldo de créditos se verifica en la primera corrida de prueba, y si no alcanza se baja el límite por corrida.
8. **Dashboard y copia de respaldo:** el sitio pide los datos al webhook y Vercel guarda la respuesta en caché, revalidando cada hora. Además, el repositorio guarda un archivo con la última corrida exportada, que se usa si el webhook falla. El webhook es público y de solo lectura, sin datos sensibles. El usuario ya tiene cuenta de Vercel y de GitHub: el código va a un repositorio suyo y se publica desde su cuenta de Vercel.
9. **Solo la última corrida:** el dashboard muestra solo la última corrida. El historial queda guardado en `fichas`, pero verlo es un próximo paso que se menciona en el informe.
10. **Número de arriba:** muestra noticias analizadas y medios, por ejemplo "142 noticias de 14 fuentes".

## 10. Además del prototipo (para después)

- Borrador del informe de 5 páginas y guion del video, a partir de este documento.
- Capturas del flujo de n8n y del dashboard para el informe.
