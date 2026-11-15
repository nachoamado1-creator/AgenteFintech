# Correcciones al dashboard Finn

## Objetivo
Pulir el dashboard Finn (Radar Fintech) antes de la entrega del TP. Hay que corregir tres problemas visuales: el punto de la "i" del título se mezcla con el resaltado al seleccionar texto, los textos del radar se pisan con los puntos, y la barra de scroll con el logo de Finn no gustó. Además se suma, como decorado de fondo, un mapa láser de Argentina conectada con el mundo, que le da dinamismo a la página sin cargarla de información. El dashboard lo usa quien quiere ver, semana a semana, cómo está Argentina en pagos y billeteras frente a la región y el mundo. Todo lo que ya funciona sigue igual: los datos del agente de n8n, los capítulos, el selector de edición, el panel de tendencias y los tickets.

## Requisitos

### 1. Punto de la "i" al seleccionar el título
1. Cuando el usuario selecciona (resalta) el título "Finn" de la portada, la parte violeta (`--violeta`) de los dos puntos (`.punto-finn`, el de la "ı" y el final) cambia a un color que contrasta con el fondo violeta de la selección (`::selection`). El color sale de la paleta actual, por ejemplo blanco o el lila claro `#d2ccfb`, y no puede ser violeta.
2. Mientras dura la selección, el punto se ve entero y se distingue del resaltado: ninguna parte se funde con el fondo violeta.
3. Al quitar la selección, el punto vuelve a sus colores originales.

### 2. Radar: legible y que se entienda que cada punto es una noticia
4. Dentro del radar no quedan textos pegados a los puntos de tendencia: se sacan los nombres que hoy se dibujan junto a cada punto (`RadarFinn.tsx`, línea ~87).
5. Las etiquetas de franja (corto, mediano, largo) y "AR · HOY" se mantienen, y ningún texto se superpone con un punto.
6. Arriba o abajo del radar aparece una leyenda visible: "Cada punto = una noticia" (el texto exacto se puede ajustar).
7. Al pasar el mouse sobre un punto, o al tocarlo en el celular, aparece una tarjetita con el título de la tendencia y su portada (la misma imagen que usa el panel de tendencias).
8. La tarjetita no tapa el punto que se está mirando y no se corta en los bordes de la pantalla.
9. El clic (o tap de confirmación) en un punto sigue abriendo el `PanelTendencia` como hoy.
10. Desde el teclado se llega a cada punto con Tab, el foco muestra la tarjetita y Enter abre el panel.

### 3. Barra de scroll: "procesando transacción"
11. Se reemplaza la ficha con la F de Finn (`BarraScroll.tsx`) por una barra fina de carga, estilo "procesando pago", que se llena según el porcentaje de página recorrido.
12. La barra muestra el porcentaje y un texto de estado tipo transacción (por ejemplo "Procesando…").
13. Al llegar al final de la página (≥ 99 %), la barra se completa y muestra un check con un estado de confirmación (por ejemplo "Aprobado").
14. Si la página no tiene scroll, la barra no se muestra (como hoy).
15. Usa los colores actuales (azul/violeta) y no lleva el logo de Finn.

### 4. Mapa láser de fondo (decorado, no sección)
16. El mapa **no es una sección nueva** ni suma un capítulo a la navegación: es un decorado de fondo que le da movimiento a lo que ya existe.
17. Va detrás del capítulo "¿Dónde están las brechas?" (los tickets), que es donde se compara a Argentina con el mundo. Ocupa el ancho del capítulo, detrás del contenido (`z-index` por debajo, `pointer-events: none`).
18. Estética láser: el contorno del mapa del mundo en puntos o trazos finos, y desde Argentina salen arcos láser hacia Brasil, México, EE.UU. y Europa. Cada arco se enciende y viaja con un brillo, en loop suave. Usa los colores azul/violeta actuales.
19. Es tenue: opacidad baja, para que los tickets y sus textos se lean exactamente igual que hoy (mismo contraste).
20. No muestra textos, cifras, tooltips ni selectores. No es interactivo.
21. El único vínculo con los datos es sutil: los arcos que dibuja son las regiones que trae la corrida en `referencia`. Si una región no viene, su arco no aparece. No hay datos escritos a mano.
22. La animación es liviana: no traba el scroll y solo corre cuando el capítulo está en pantalla.

### 5. No romper nada
23. Las pruebas actuales (`lib/*.test.ts`, `contract/validar.test.ts`) siguen pasando.
24. El build de Next (`npm run build`) termina sin errores y el lint sin errores nuevos.
25. Los capítulos, el selector de edición, el estado EN VIVO / COPIA GUARDADA, el panel de tendencias, los tickets y la lluvia de la portada se ven y funcionan igual que antes.

## Fuera de alcance
- Cambios en el agente de n8n, en el contrato de datos o en el esquema `radar.schema.json`.
- Indicadores nuevos escritos a mano o fuentes externas para el mapa.
- Que el mapa informe algo por sí mismo: cifras, leyendas, tooltips, selector de temas, comparación atrasada/adelantada.
- Un capítulo nuevo o una entrada nueva en la navegación.
- Rediseño de otras secciones: paleta, tipografía, capítulos, tickets, panel.
- Mapa con zoom, arrastre o detalle por provincia.
- Cambiar el cursor, la lluvia o el logo de la barra superior.

## Casos borde
- **Corrida sin `referencia` o con regiones faltantes:** se ve solo el contorno del mapa con los arcos de las regiones que haya (o ninguno). No se rompe ni se inventa nada.
- **Corrida de ejemplo o provisoria:** el mapa funciona igual, y el estado de la barra superior sigue diciendo EJEMPLO.
- **Radar con puntos muy cerca:** la tarjetita del punto activo queda arriba de todo y se ve entera.
- **Celular (≤ 400 px):** el mapa de fondo se adapta o se recorta sin generar scroll horizontal. Las tarjetitas se abren con tap y se cierran tocando afuera. La barra de scroll no tapa contenido.
- **Usuario con "reducir movimiento":** el mapa y los arcos quedan fijos, sin animación.
- **Clics sobre los tickets:** el fondo nunca intercepta clics ni selección de texto.
- **Seleccionar solo parte del título:** el punto cambia de color solo si la selección lo incluye, o si incluye todo el título.
- **Página corta o ventana muy alta sin scroll:** la barra de transacción no aparece.

## Definición de terminado
- [ ] Al seleccionar "Finn" con el mouse, los dos puntos se ven completos y en un color distinto al violeta del resaltado. Al deseleccionar, vuelven a como estaban.
- [ ] En el radar no hay ningún nombre de tendencia dibujado junto a un punto, y ningún texto pisa un punto (revisado en 1440 px y 375 px).
- [ ] El radar muestra la leyenda "Cada punto = una noticia".
- [ ] Al pasar el mouse por un punto del radar aparece una tarjetita con título y portada. El clic abre el panel de tendencias como antes.
- [ ] Con Tab se recorren los puntos del radar, cada uno muestra su tarjetita y Enter abre el panel.
- [ ] La barra de scroll ya no tiene la F de Finn: es una barra de carga con % y estado, y al final de la página muestra un check de "Aprobado".
- [ ] Detrás de los tickets se ve un mapa del mundo tenue con arcos láser animados que salen de Argentina hacia las regiones de la corrida.
- [ ] El mapa no tiene textos ni es interactivo, y no aparece ningún capítulo nuevo en la navegación.
- [ ] Los tickets se leen igual que antes y sus enlaces y selección de texto funcionan con el mapa detrás.
- [ ] Una corrida sin `referencia` muestra el mapa sin arcos y no tira errores en la consola.
- [ ] Con "reducir movimiento" activado el mapa queda quieto.
- [ ] El scroll por el capítulo de brechas se siente fluido, sin trabas visibles.
- [ ] `npm test` y `npm run build` pasan sin errores.
- [ ] Recorrida completa de la página sin errores en la consola y con todas las secciones anteriores intactas.
