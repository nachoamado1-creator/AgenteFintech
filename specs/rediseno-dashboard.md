# Rediseño del dashboard Radar Fintech

## Objective
Reordenar la pantalla del dashboard siguiendo la disposición de la referencia (tablero tipo "Encore": título grande arriba a la izquierda, recuadros chicos arriba a la derecha, fila de tarjetas en el medio y dos paneles grandes abajo), manteniendo la estética actual de vidrio líquido en modo oscuro, con paleta azul/violeta y aspecto más tecnológico. La usan el grupo y los docentes en la presentación del TP para ver de un vistazo cómo está Argentina frente al mundo en los cuatro temas y qué tendencias vienen, eligiendo el horizonte, el tema y la edición semanal.

## Requirements

### Disposición general
1. La pantalla sigue este orden de zonas, de arriba hacia abajo y de izquierda a derecha:
   - Arriba a la izquierda: sección **Radar Fintech**.
   - Arriba a la derecha, en columna: recuadro de **tendencias que van pasando** (arriba) y recuadro chico de **estado de datos y edición** (abajo).
   - Fila del medio, a todo el ancho: **carrusel de tendencias**.
   - Abajo a la izquierda: **Argentina hoy, frente al mundo**.
   - Abajo a la derecha: **Detalle**.
2. Se mantiene la estética actual: fondo oscuro `#09090B`, manchas de luz azul y violeta desenfocadas, tarjetas de vidrio translúcido con borde sutil y esquinas de 24 px, tipografía Inter y transiciones suaves.
3. Se elimina de esta pantalla la sección **Metodología**.
4. Se elimina la sección **Balance de brechas**.

### Radar Fintech (arriba a la izquierda)
5. El título principal es "Radar Fintech", en tamaño grande, alineado arriba a la izquierda.
6. Debajo del título va el subtítulo "Pagos y billeteras en Argentina".
7. Debajo del subtítulo va el texto "Qué pasa hoy, qué puede venir y dónde están las brechas frente a Brasil, México, EE.UU. y Europa."
8. Debajo de todo el texto va el filtro de horizonte temporal tipo píldora, con las opciones exactas "0 - 1 año", "1 - 3 años" y "3 - 10 años". La opción elegida es blanca con texto oscuro y se desliza al cambiar. Al cargar, está elegida "0 - 1 año".
9. El filtro de horizonte deja de estar en la barra superior.

### Tendencias que van pasando (arriba a la derecha)
10. Es un recuadro chico que muestra una tendencia por vez, solo con texto: nombre de la tendencia y tema.
11. Muestra únicamente las tendencias del horizonte elegido.
12. Pasa a la siguiente tendencia cada 4 segundos y vuelve a la primera al llegar al final.
13. Se frena mientras el mouse está encima y sigue al sacarlo.
14. Al hacer click en la tendencia visible, esa tendencia se abre en el panel de Detalle.
15. Al cambiar el horizonte, se reinicia con la primera tendencia del nuevo horizonte.

### Estado de datos y edición (arriba a la derecha, debajo)
16. Es un recuadro más chico y con menos peso visual que el resto.
17. Muestra si los datos son en vivo o una copia guardada, y el aviso de resúmenes provisorios cuando corresponde, en texto chico.
18. Tiene un selector de edición semanal que lista todas las ediciones guardadas, una por día (si hay varias corridas el mismo día, solo la última), con la fecha en formato "13 nov 2026".
19. Por defecto está elegida la edición más reciente.
20. Al elegir otra edición, cambian todos los datos de la pantalla (tendencias, medidor, detalle y totales).

### Carrusel de tendencias (fila del medio)
21. Muestra una tarjeta por cada tendencia del horizonte elegido, con tema, nombre, capacidad y cantidad de fuentes.
22. Si no entran todas, la fila se desliza hacia el costado, con flechas y arrastrando.
23. Al hacer click en una tarjeta, esa tendencia se abre en el panel de Detalle.
24. Se elimina el filtro de tipo de empresa (todas, grande, chica).

### Argentina hoy, frente al mundo (abajo a la izquierda)
25. La sección se llama "Argentina hoy, frente al mundo".
26. Muestra un solo tema por vez, con un filtro para elegirlo entre Pagos instantáneos, Open finance, Stablecoins e IA aplicada. Al cargar, está elegido el primero.
27. La brecha se muestra con un medidor tipo arco de 0 a 3, con tres marcas: Argentina (resaltada), Brasil/México y EE.UU./UE.
28. Junto al medidor se muestran las dos brechas en texto: frente a Brasil/México y frente a EE.UU./UE, con su estado (atrasada, pareja o adelantada) y la diferencia ("−2", "+1").
29. Una región sin datos se indica como "Sin datos" y no se dibuja su marca en el medidor.
30. Al cambiar el tema, el panel de Detalle muestra ese tema.

### Detalle (abajo a la derecha)
31. Muestra el tema elegido (resumen, quiénes se mueven, inversión y capacidad, qué mirar y fuentes con link) o la tendencia elegida (resumen, horizonte, capacidad y fuentes con fecha y cita).
32. Lo último que se eligió (tema o tendencia) es lo que se muestra.

### Celular
33. En celular (375 px de ancho), las zonas se apilan en una columna en este orden: Radar Fintech, tendencias que van pasando, estado y edición, carrusel, Argentina hoy, Detalle.

## Out of scope
- Animaciones nuevas más allá de las transiciones actuales: se agregan después con skills que va a pasar el usuario.
- Imágenes en el recuadro de tendencias.
- Página de metodología aparte.
- Cambios en el agente de n8n: cantidad de fuentes, modelo de IA y consumo de la API (se tratan aparte).
- Correr el agente para generar las ediciones de hoy y del martes.
- Comparar dos ediciones entre sí.

## Edge cases
- Horizonte sin tendencias: el recuadro de tendencias y el carrusel muestran el mensaje "No hay tendencias en este horizonte" en lugar de quedar vacíos.
- Horizonte con una sola tendencia: el recuadro no rota y el carrusel no muestra flechas.
- Una sola edición guardada: el selector se ve, con esa única opción elegida.
- El agente no responde: se muestra la última edición guardada y el recuadro de estado lo avisa en texto chico.
- Edición provisoria: el aviso aparece en el recuadro de estado, en texto chico.
- La tendencia abierta en el detalle no pertenece al nuevo horizonte después de cambiarlo: el detalle sigue mostrándola hasta que se elija otra cosa.
- Al cambiar de edición, si el tema o la tendencia elegida no existe en la nueva edición, el detalle vuelve al primer tema.
- Tendencias con nombres largos: el texto se corta en dos líneas como máximo, sin romper el recuadro.

## Definition of done
- [ ] Se ve bien y sin scroll horizontal en computadora y en celular (375 px de ancho).
- [ ] Cambiar el horizonte actualiza a la vez el recuadro de tendencias y el carrusel.
- [ ] Cambiar el tema actualiza el medidor y el detalle.
- [ ] Elegir otra edición en el selector cambia todos los datos de la pantalla.
- [ ] Si un horizonte no tiene tendencias, aparece un mensaje en lugar de un recuadro vacío.
- [ ] Si el agente no responde, se muestra la última edición guardada con un aviso chico.
- [ ] El recuadro de tendencias cambia cada 4 segundos, se frena con el mouse encima y al hacer click abre la tendencia en el detalle.
- [ ] No aparecen en pantalla Metodología, Balance de brechas ni el filtro de tipo de empresa.
- [ ] Los títulos y textos de Radar Fintech y "Argentina hoy, frente al mundo" coinciden exactamente con los de esta especificación.
