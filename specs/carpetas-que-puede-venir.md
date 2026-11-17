# Carpetas de plazos en "¿Qué puede venir?"

## Objective
En la sección 02 "¿Qué puede venir?" del dashboard, hoy cuesta encontrar las noticias de cada plazo: hay que tocar unas pestañas (Corto, Mediano y Largo plazo) y recién ahí aparece la cadena de bloques. Este cambio guarda las noticias de cada plazo en una carpeta de vidrio, basada en el componente "Glass Folder Cards" de 21st.dev. Al principio se ven las 3 carpetas cerradas. Al pasar el cursor por una, se inclina y asoman sus noticias. Al abrirla, aparece un carrusel con las mismas tarjetas de hoy, y si tocás una se abre el mismo panel lateral de siempre. Es para quien mira el dashboard del TP y quiere ver de un vistazo qué hay en cada plazo.

## Requirements
1. La sección 02 "¿Qué puede venir?" muestra 3 carpetas, en este orden: **Corto plazo (0 - 1 año)**, **Mediano plazo (1 - 3 años)** y **Largo plazo (3 - 10 años)**. Los nombres y rangos salen de `HORIZONTES` en `lib/vista.ts`.
2. Las carpetas reemplazan las pestañas de plazo (`linea-tiempo`) que hoy están dentro de `Cadena`. Esas pestañas dejan de verse en la sección 02.
3. Cada carpeta muestra en el frente su nombre (por ejemplo, "Corto plazo") y, en la segunda línea, cuántas noticias tiene (por ejemplo, "3 noticias", "1 noticia" o "0 noticias").
4. Al cargar la página, las 3 carpetas están **cerradas** y no se ve ningún carrusel.
5. Al pasar el cursor por una carpeta cerrada (o al enfocarla con el teclado), el frente de vidrio se inclina hacia adelante y las noticias asoman un poco, como en el componente original. Al sacar el cursor, vuelve a quedar cerrada.
6. Las hojas que asoman dentro de cada carpeta son sus noticias reales: muestran el nombre de la tendencia y, cuando la hay, su imagen de portada. Se ven como máximo 4 hojas por carpeta.
7. Tocar una carpeta (clic, Enter o Espacio) la abre: el frente cae hacia adelante, las hojas se abren en abanico y debajo de las carpetas aparece el **carrusel** con todas las noticias de ese plazo.
8. Solo puede haber una carpeta abierta a la vez. Si abrís otra, la anterior se cierra y el carrusel pasa a mostrar las noticias del plazo nuevo.
9. Tocar de nuevo la carpeta abierta, o apretar Escape, la cierra y oculta el carrusel.
10. Las tarjetas del carrusel son **las mismas tarjetas de hoy** (`bloque`): portada, hash, "BLOQUE 01", nombre de la tendencia, el chip del tema y la cantidad de fuentes. El contenido y el estilo de cada tarjeta no cambian.
11. El carrusel se desplaza en horizontal. Tiene flechas de anterior y siguiente, y también se puede deslizar con el mouse, el trackpad o el dedo.
12. Tocar una tarjeta del carrusel abre el mismo panel lateral (`PanelTendencia`) que hoy, con el resumen y la noticia original, y se puede navegar entre las noticias de ese plazo igual que ahora.
13. Tocar una hoja dentro de la carpeta abierta también abre el panel lateral de esa noticia.
14. Las carpetas usan los colores azul y violeta del dashboard, con un tono distinto para cada plazo. No se usan los colores originales del componente (aurora, ember, dusk).
15. Las carpetas **no** tienen el botón "+" para agregar archivos ni el menú "···": no se pueden agregar ni borrar noticias desde la carpeta.
16. La bajada de la sección se adapta: con todo cerrado, invita a abrir una carpeta (por ejemplo, "Abrí una carpeta para ver sus noticias. Tocá una para ver el resumen y la noticia original."). Con una carpeta abierta, dice el plazo y cuántas noticias tiene, como hoy.
17. El radar (`RadarFinn`) y el resto de las secciones (01 y 03) no cambian. Si hoy tocar un punto del radar cambia el plazo, ahora tiene que abrir la carpeta de ese plazo.

## Out of scope
- Cambios en el radar, en la sección 01 "¿Qué pasa hoy?" o en la 03 "¿Dónde están las brechas?".
- Cambios en el panel lateral (`PanelTendencia`) o en el diseño de las tarjetas `bloque`.
- Agregar, renombrar, mover o borrar noticias desde las carpetas.
- Cambios en los datos, en el flujo de n8n o en la forma de clasificar las noticias por plazo.
- La presentación animada (`finn-presentacion-animada.html`).

## Edge cases
- **Plazo sin noticias:** la carpeta igual se muestra, con "0 noticias" y sin hojas adentro. Si la abrís, en lugar del carrusel aparece el mensaje vacío de hoy ("Sin bloques minados en este horizonte").
- **Noticia sin imagen:** la hoja de la carpeta se muestra como una hoja de papel con su nombre, y la tarjeta del carrusel usa la imagen de respaldo del tema, como hoy.
- **Nombre de tendencia largo:** en la hoja de la carpeta se corta con "…" y no rompe el diseño.
- **Más de 4 noticias en un plazo:** en la carpeta asoman solo 4 hojas, pero el número del frente y el carrusel muestran todas.
- **Pantallas táctiles (sin cursor):** no hay efecto de cursor. Tocar la carpeta la abre directamente.
- **Celular:** las 3 carpetas se apilan una debajo de otra y entran en el ancho de la pantalla, sin scroll horizontal de la página. El carrusel aparece debajo de las carpetas.
- **Movimiento reducido:** si el sistema tiene activado "reducir movimiento", no hay animaciones, pero abrir, cerrar y el carrusel siguen funcionando.
- **Tocar un punto del radar con todas las carpetas cerradas:** se abre la carpeta del plazo de esa noticia y se abre su panel lateral.

## Definition of done
- [ ] En la sección 02 se ven 3 carpetas, en orden Corto, Mediano y Largo plazo, cada una con su rango de años y su cantidad de noticias.
- [ ] Las pestañas de plazo de la sección 02 ya no aparecen.
- [ ] Al cargar la página, las 3 carpetas están cerradas y no hay carrusel visible.
- [ ] Al pasar el cursor por una carpeta, el vidrio se inclina y asoman las noticias. Al sacarlo, vuelve a cerrarse.
- [ ] Al tocar "Corto plazo" aparece el carrusel con la misma cantidad de tarjetas que dice la carpeta.
- [ ] Las tarjetas del carrusel se ven igual que los bloques de hoy (portada, hash, número de bloque, nombre, chip del tema, fuentes).
- [ ] Las flechas del carrusel lo mueven a la tarjeta anterior y a la siguiente.
- [ ] Al tocar una tarjeta (por ejemplo, la de impacto en la economía, GIG o cambios regulatorios) se abre el panel lateral con su resumen y su link, igual que hoy.
- [ ] Al abrir "Mediano plazo" con "Corto plazo" abierta, Corto se cierra y el carrusel muestra las noticias de Mediano.
- [ ] Escape, o tocar de nuevo la carpeta abierta, la cierra y oculta el carrusel.
- [ ] Un plazo sin noticias muestra "0 noticias" y, al abrirlo, el mensaje de vacío.
- [ ] Las carpetas no tienen botón "+" ni menú "···".
- [ ] Los colores de las carpetas son azules o violetas, y cada plazo tiene un tono distinto.
- [ ] En un ancho de 375 px no hay scroll horizontal de la página y las carpetas se ven completas.
- [ ] El radar y las secciones 01 y 03 se ven y funcionan igual que antes.
- [ ] No hay errores en la consola del navegador y el build del dashboard compila.
