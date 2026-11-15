# Rediseño Bento · Liquid Glass del dashboard

Fecha: 2026-11-15 · Aprobado por el usuario. Reemplaza las partes de `specs/rediseno-dashboard.md` que choquen (medidor de arco, carrusel grande, selector de tema segmentado).

## Por qué
El dashboard se ve como un "template genérico de IA": fondo morado invasivo y mucho texto chico suelto. Se busca una estética premium, compacta y visual, tipo Bento (Refero) en modo oscuro, con vidrio líquido azul/violeta.

## Objetivos / no objetivos
- Objetivo: nueva estructura Bento y estética Liquid Glass.
- No objetivo: tocar la carga de datos (`app/page.tsx`, `lib/datos.ts`, `lib/portadas.ts`, `lib/tipos.ts`). La inyección del JSON queda igual.
- Anti-objetivo: perder información que hoy existe (edición semanal, totales, aviso provisorio) o romper las pruebas.

## Enfoques considerados
1. **Elegido:** reestructurar el JSX de `components/Radar.tsx` (y `MapaRadar.tsx` donde haga falta) y reescribir `app/globals.css` sobre las clases existentes, con los valores pedidos. Menos riesgo, mismo resultado visual.
2. Reescribir todo con utilidades Tailwind en los componentes: más diff y más riesgo, sin ganancia visual.
3. Componentes nuevos desde cero: exagerado para un cambio de diseño.

## Diseño
**Fondo:** `#05050A`, orbes desenfocados (blur ≥100px) cobalto y violeta en las esquinas traseras, opacidad 10–15%.

**Vidrio (todas las tarjetas):** fondo `rgba(255,255,255,0.03)`, borde `rgba(255,255,255,0.10)`, `backdrop-filter: blur(40px)` (≈ `backdrop-blur-2xl`), `box-shadow: inset 0 1px 0 rgba(255,255,255,0.08)`.

**Tipografía:** Space Grotesk (vía `next/font`) para títulos y números; Inter para texto corrido. Título "RADAR FINTECH" en bold, `tracking-tighter`, degradé de blanco a azul hielo. Se deja de usar Fraunces.

**Cabecera (fila 1)**
- Izquierda: "RADAR FINTECH", bajada corta "Pagos y billeteras · Argentina", y debajo el filtro de horizonte (0-1, 1-3, 3-10 años).
- Derecha: recuadro compacto "tendencia en auge": rota las tendencias del horizonte elegido, una cada 4 s; se frena con el mouse encima; vuelve a la primera al cambiar el horizonte. Al tocarla se abre en el Detalle y la página se desplaza suavemente hasta él. Debajo, chico, el selector de edición semanal.

**Fila 2: 4 tarjetas de tema** (Pagos instantáneos/QR, Open Finance, Stablecoins, IA aplicada)
- Título y dos brechas: vs Brasil/México y vs EE.UU./UE, cada una con badge: verde brillante "adelantada", gris "pareja", rojo/naranja tenue "atrasada", con la diferencia (+1, −2). Sin datos → badge "Sin datos".
- Click en una tarjeta = elegir ese tema (reemplaza al selector segmentado de tema).

**Fila 3, izquierda: Radar interactivo** (`MapaRadar`)
- Centro (0-1 año) es lo más brillante; los anillos exteriores pierden opacidad progresivamente.
- Líneas divisorias sutiles separando los 4 temas.

**Fila 3, derecha: Detalle**
- Tendencia: portada grande arriba (si hay), tema, nombre, horizonte, **capacidad** (`grande`/`chica`/`ambas`, hoy no se muestra), resumen, fuentes.
- Tema: resumen, quiénes se mueven, inversión y capacidad, qué mirar, fuentes.
- Fuentes: grilla de pills anchas en 2 columnas, cada una con dominio y ↗ (abre en pestaña nueva). Se sacan miniaturas, fecha y cita de las fuentes.

**Scroll automático:** al elegir una tendencia (ticker o punto del radar) o un tema (tarjeta), se desplaza suavemente hasta el Detalle, en compu y en celular.

**Pie:** totales (noticias · fuentes · tendencias), aviso de resúmenes provisorios y fecha de generación.

**Se elimina:** el carrusel grande (`Carrusel.tsx` deja de usarse) y la leyenda de adopción por región.

**Celular (375 px):** una columna: cabecera, ticker + edición, 4 tarjetas (2×2 o apiladas), radar, detalle.

## Decisiones del builder (marcadas como propias)
- Valores exactos de colores de badges y degradé, dentro de la paleta azul/violeta.
- Si `Carrusel.tsx` se borra o solo se deja de importar.
- Ajuste de `--fondo` y `themeColor` a `#05050A`.
