# Retoques Finn 2

## Objective
Segunda tanda de retoques visuales del dashboard Finn antes de subirlo a Vercel. Limpia elementos redundantes (botones de horizonte, leyenda del radar, nota de brecha en los tickets, pie de página), deja el radar mostrando todo de una vez y suma dos toques de identidad fintech: selección de texto en violeta y una barra de scroll propia con estética de cotización. Es para quien mira el dashboard en la presentación del TP: menos texto explicativo, el diseño se explica solo.

## Requirements
1. Se eliminan los botones "corto / mediano / largo" (píldora de horizonte de la portada, `components/Tablero.tsx`) junto con su nota emergente (`horizonte__nota`).
2. El horizonte se sigue pudiendo cambiar desde el roadmap de la sección 2; esa sección conserva su comportamiento actual.
3. En el radar (`components/RadarFinn.tsx`) todos los puntos de los tres horizontes se ven encendidos siempre, con el mismo estilo "activo". Ningún anillo ni etiqueta de franja queda atenuado.
4. Tocar cualquier punto del radar sigue abriendo el panel de esa tendencia.
5. Se elimina el texto "Centro = Argentina hoy · cada anillo, un horizonte · tocá un punto" del radar.
6. Se elimina de todos los tickets de brecha la línea "*** brecha = nivel de Argentina − nivel de la región ***" (`components/Ticket.tsx`). La fila "TOTAL BRECHA · VS MUNDO" se mantiene.
7. Se elimina el pie de página completo (`<footer className="pie">` en `Tablero.tsx`, con la fecha de generación y los créditos de Unsplash) y su CSS asociado.
8. Al seleccionar texto en cualquier parte del dashboard, el fondo de la selección es violeta (el violeta de la paleta Finn) y el texto seleccionado cambia a blanco.
9. La barra de scroll de la página se reemplaza por una barra propia con estilo fintech:
   - Riel vertical fino con marcas de escala, como el eje de un gráfico de cotización.
   - Tirador con forma de moneda/ficha circular con el símbolo de Finn.
   - Junto a la ficha se muestra el porcentaje de página recorrido (0 %–100 %), como una cotización.
   - Colores dentro de la paleta Finn (azul/violeta).
   - Arrastrar la ficha hace scroll de la página; hacer clic en el riel salta a esa posición.
10. La barra nativa del navegador queda oculta en la página principal para que no se vean dos barras.

## Out of scope
- Cambios de contenido o datos del agente n8n.
- Cambios en la sección 2 (roadmap) más allá de seguir siendo el control de horizonte.
- Rediseño del radar (tamaño, colores, cuadrantes) más allá de encender todos los puntos.
- Barras de scroll horizontales internas (ej. cadena de bloques): se dejan como están.
- Reubicar los créditos de Unsplash en otro lugar.

## Edge cases
- Mobile / pantallas táctiles: la barra custom no debe tapar contenido ni bloquear el scroll con el dedo; si no entra, se oculta y queda el scroll nativo táctil.
- Página que no tiene scroll (contenido más corto que la pantalla): la barra custom no se muestra.
- Redimensionar la ventana: el riel, la posición de la ficha y el % se recalculan.
- `prefers-reduced-motion`: la ficha se mueve sin animaciones extra.
- Puntos del radar superpuestos al estar todos encendidos: todos deben seguir siendo clicables.
- Selección de texto sobre elementos que ya son violetas (ej. "ATRASADA −1"): el texto seleccionado igual se ve blanco y legible.
- Sin el pie, la última sección no debe quedar pegada al borde inferior (mantener margen).

## Definition of done
- [ ] En la portada no aparece ningún botón corto/mediano/largo ni la nota de horizonte.
- [ ] Cambiar horizonte desde el roadmap de la sección 2 sigue funcionando.
- [ ] Al cargar, el radar muestra encendidos todos los puntos de los tres anillos, sin atenuados.
- [ ] Clic en un punto de cualquier anillo abre su panel.
- [ ] El texto "Centro = Argentina hoy…" no está en el DOM.
- [ ] Ningún ticket contiene "brecha = nivel de Argentina"; la fila TOTAL BRECHA sigue visible.
- [ ] No existe `<footer class="pie">` en el DOM ni su CSS en `globals.css`.
- [ ] Seleccionar texto muestra fondo violeta y letras blancas (verificable con `::selection` en estilos computados).
- [ ] Se ve un riel con marcas de escala y una ficha con el símbolo Finn; no se ve la barra nativa.
- [ ] Hacer scroll mueve la ficha y el % pasa de 0 % arriba a 100 % abajo.
- [ ] Arrastrar la ficha y clic en el riel hacen scroll a la posición correspondiente.
- [ ] En vista mobile (375 px) no hay scroll horizontal ni contenido tapado.
- [ ] `npm run build` termina sin errores y la consola del navegador no muestra errores.
