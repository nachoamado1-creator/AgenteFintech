# Dashboard Radar Fintech — "Capítulos fintech"

## Objective
Rediseñar el dashboard del Radar Fintech (Pagos y billeteras en Argentina) para que deje de verse como un template genérico y responda, en orden y de un vistazo, las tres preguntas de la consigna del TP: **¿Qué está pasando hoy?**, **¿Qué puede venir?** (corto, mediano y largo plazo) y **¿Dónde están las brechas?** frente a Brasil, México, EE.UU. y Europa. La página se lee de arriba hacia abajo y cada pregunta es un capítulo numerado. La estética no es de revista ni el "default fintech" (vidrio, gradientes violeta/azul): toma los objetos del mundo fintech y le da a cada uno una función. La lluvia de datos va en la portada, las tarjetas de crédito en "Hoy", la cadena de bloques en "Lo que viene" y los tickets/comprobantes en "Brechas". El naranja Bitcoin es el acento común. La usan el grupo y los docentes (analistas de industria) en la demo, el video y la corrección del TP, con entrega el lunes 16/11/2026 a las 12:00.

## Requirements

### Sistema visual
1. Solo modo oscuro: fondo casi negro (`#07070A` o similar), sin vidrio esmerilado, sin manchas de luz azul/violeta y sin gradientes violeta-azul de fondo.
2. Tipografía: **Bricolage Grotesque** para títulos y números grandes y **Martian Mono** para datos, hashes, etiquetas y tickets, ambas cargadas desde Google Fonts. Inter y Fraunces dejan de usarse.
3. Los títulos de capítulo, el titular de portada y los números grandes usan `letter-spacing` negativo, entre `-0.03em` y `-0.06em`.
4. Cada tema tiene un color fijo que se repite igual en tarjeta, bloque, ticket, panel y texto resaltado:
   - Pagos instantáneos `#22D3EE`
   - Open finance `#A78BFA`
   - Stablecoins `#26A17B`
   - IA aplicada `#F472B6`
5. El acento global para lo que hay que mirar sí o sí es el naranja Bitcoin `#F7931A`.
6. En los textos (frase de portada, resúmenes, dorso de tarjetas, panel) las palabras clave van resaltadas con color de acento:
   - nombres de tema, en el color del tema;
   - estados: "atrasada" en naranja Bitcoin, "pareja" en gris claro y "adelantada" en verde;
   - cifras y países, en blanco con peso mayor.

### Barra superior (fija)
7. Muestra la marca "Radar Fintech", el filtro de horizonte tipo píldora con las opciones exactas "0 - 1 año", "1 - 3 años" y "3 - 10 años" (por defecto "0 - 1 año") y el selector de edición semanal (una edición por día, la más reciente por defecto, fecha con formato "13 nov 2026").
8. Al cambiar de edición se actualizan todos los capítulos. Al cambiar de horizonte se actualizan los capítulos 01 y 02.
9. Un indicador chico en mono dice "EN VIVO" o "COPIA GUARDADA", más el aviso de resúmenes provisorios cuando corresponde.
10. La barra tiene anclas a los tres capítulos (01 Hoy, 02 Lo que viene, 03 Brechas) y resalta el capítulo visible.

### Portada · lluvia de datos
11. Fondo con lluvia de caracteres fintech (`$`, `₿`, `₮`, `ARS`, `USD`, dígitos, siglas de temas) en los colores de tema con baja opacidad. Se dibuja en un canvas y no bloquea la interacción.
12. Titular grande "Radar Fintech" con tracking negativo y subtítulo "Pagos y billeteras en Argentina".
13. Una **frase del día** armada con los datos de la edición elegida, sin llamar a ninguna IA, que nombra el tema más adelantado y el más atrasado frente al mundo según `estado_global`. Ejemplo: "Argentina va **adelantada** en **pagos instantáneos** y **atrasada** en **open finance**". Usa los resaltados del requisito 6.
14. Tres cifras grandes con su etiqueta en mono: cantidad de noticias, cantidad de fuentes y cantidad de tendencias de la edición.
15. La lluvia baja su velocidad y opacidad al hacer scroll fuera de la portada.

### Capítulo 01 · ¿Qué está pasando hoy? — Tarjetas
16. Encabezado "01" + título "¿Qué está pasando hoy?" + bajada de una línea.
17. Cuatro tarjetas con proporción de tarjeta de crédito (≈ 1.586 : 1), una por tema. Cada una tiene:
   - imagen del tema como arte de fondo, teñida con su color;
   - chip dibujado;
   - nombre del tema;
   - el nivel de adopción de Argentina "en relieve", como el número de una tarjeta (por ejemplo `NIVEL 2/3`);
   - el estado frente al mundo (atrasada / pareja / adelantada) como si fuera la "fecha de vencimiento".
18. Al pasar el mouse, la tarjeta se inclina levemente y muestra un brillo holográfico que sigue al cursor.
19. Al hacer clic, la tarjeta se da vuelta (animación 3D). El dorso tiene el resumen del tema con resaltados, proveedores, inversión y un botón "Ver tendencias del tema" que abre el panel de detalle con la primera tendencia de ese tema en el horizonte elegido.
20. Un segundo clic, o Esc, vuelve la tarjeta al frente.

### Capítulo 02 · ¿Qué puede venir? — Cadena de bloques
21. Encabezado "02" + título "¿Qué puede venir?" + bajada.
22. Las tendencias del horizonte elegido se muestran como bloques encadenados en orden, unidos por un conector visible (línea o eslabón).
23. Cada bloque muestra:
   - la portada de la noticia de su primera fuente, o la imagen de respaldo del tema;
   - un "hash" corto derivado del nombre (por ejemplo `#a3f9`, siempre igual para la misma tendencia);
   - el nombre de la tendencia con tracking negativo;
   - la etiqueta del tema en su color;
   - la cantidad de fuentes.
24. Sobre la cadena hay una línea de tiempo con los tres horizontes (corto · mediano · largo) que marca cuál está activo. Hacer clic en un horizonte de esa línea equivale a cambiar el filtro de la barra superior.
25. Al hacer clic en un bloque se abre el panel de detalle de esa tendencia.

### Capítulo 03 · ¿Dónde están las brechas? — Tickets
26. Encabezado "03" + título "¿Dónde están las brechas?" + bajada que explica el criterio (nivel de adopción 0–3 de Argentina frente a cada referencia).
27. Un ticket por tema: fondo claro tipo papel térmico, borde superior e inferior troquelado, tipografía mono y encabezado con el nombre del tema en su color.
28. Cada ticket tiene una línea por región (AR, BR, MX, US, EU) con el nivel (0–3) y una barra de puntos, tomados de `referencia`. AR va resaltada.
29. Al pie, una línea "TOTAL BRECHA" con el estado frente a la región y frente al mundo (`estado_regional`, `estado_global`) resaltado según el requisito 6, y el valor numérico de la brecha cuando existe.
30. Cada línea de país enlaza a su `url` de fuente (pestaña nueva). Hay un sello "VERIFICADO" junto a las líneas que tienen URL.

### Panel de detalle de tendencia (lateral)
31. Panel que entra desde la derecha y deja ver el dashboard detrás, oscurecido. En escritorio ocupa entre 420 y 520 px de ancho.
32. Contenido, en este orden:
   1. Portada de la noticia de la primera fuente, grande, con un velo del color del tema (o la imagen de respaldo).
   2. Nombre de la tendencia con tracking negativo.
   3. Etiquetas de tema (en su color) y de horizonte ("0 - 1 año", "1 - 3 años" o "3 - 10 años").
   4. Resumen con palabras clave resaltadas.
   5. Lista de fuentes: una fila por fuente, con medio, fecha ("13 nov 2026"), la cita si existe y el botón **"Leer la noticia original ↗"**, que abre la URL en una pestaña nueva con `rel="noopener noreferrer"`.
33. El panel **no** muestra si la tendencia aplica a empresas grandes o chicas (campo `capacidad`).
34. Se cierra con la X, con Esc y con un clic fuera del panel. Al cerrarse, el foco vuelve al elemento que lo abrió.
35. Mientras está abierto, la página de fondo no se desplaza. El foco queda atrapado dentro del panel.
36. Flechas "anterior / siguiente" recorren las tendencias del horizonte activo sin cerrar el panel.

### Imágenes
37. Las tarjetas de tema usan una imagen fija por tema sacada de Unsplash (vía el MCP de Unsplash), descargada al proyecto, con crédito al autor visible en el pie de la página.
38. Bloques y panel usan las portadas reales que ya obtiene `obtenerPortadas`. Si una tendencia no tiene portada, se usa la imagen de respaldo de su tema.

### Responsive y movimiento
39. A 375 px de ancho no hay scroll horizontal, las tarjetas y los tickets quedan en una columna, la cadena se apila en vertical y el panel ocupa la pantalla completa.
40. Con `prefers-reduced-motion: reduce` se apagan la lluvia de datos, la inclinación y el brillo holográfico. La vuelta de tarjeta pasa a un fundido.

## Out of scope
- Modo claro o selector de tema.
- Cambios en el agente de n8n, en el formato de los datos o en la API (`Radar · 3`).
- La sección "Metodología" y el "Balance de brechas" del diseño anterior.
- Mostrar la capacidad (empresas grandes / chicas) en cualquier parte de la UI.
- Comparar dos ediciones lado a lado.
- Generar texto con IA desde el dashboard: la frase del día se arma con reglas fijas.
- Búsqueda o filtros por tema dentro de los capítulos.

## Edge cases
- **Horizonte sin tendencias:** el capítulo 02 muestra un único bloque vacío con borde punteado y el texto "Sin bloques minados en este horizonte". El botón "Ver tendencias del tema" de una tarjeta se deshabilita si ese tema no tiene tendencias en el horizonte.
- **Región sin dato en `referencia`:** la línea del ticket muestra "s/d", sin barra y sin sello.
- **`brecha_regional` / `brecha_global` o estados en `null`:** el pie del ticket muestra "s/d" en gris, y la frase del día omite los temas sin estado. Si ningún tema tiene estado, muestra "Sin datos suficientes para comparar con el mundo en esta edición".
- **Todos los temas en el mismo estado:** la frase del día lo dice en una sola cláusula (por ejemplo, "Argentina va **pareja** con el mundo en los cuatro temas").
- **Tendencia sin fuentes:** el panel muestra "Sin fuente registrada" y no muestra el botón de noticia original. El bloque muestra "0 fuentes".
- **URL de fuente que es redirección de Google Noticias:** se abre tal cual, en pestaña nueva.
- **Portada que falla al cargar** (error 404 o bloqueada): se reemplaza por la imagen de respaldo del tema, sin icono roto.
- **Datos de ejemplo o provisorios** (`ejemplo` / `provisorio`): el indicador de la barra lo muestra.
- **Nombres de tendencia largos:** se cortan a 3 líneas en el bloque y se muestran completos en el panel.
- **Edición más vieja y más nueva:** todos los capítulos renderizan sin errores de consola.

## Definition of done
- [ ] Desplegado en la URL de producción de Vercel y accesible sin login.
- [ ] Al hacer scroll de arriba hacia abajo aparecen, en este orden: Portada, 01 ¿Qué está pasando hoy?, 02 ¿Qué puede venir?, 03 ¿Dónde están las brechas?
- [ ] En el CSS calculado de títulos y números grandes se usan Bricolage Grotesque y Martian Mono (no Inter) y `letter-spacing` negativo.
- [ ] La frase del día cambia al elegir otra edición y resalta con color al menos un tema y un estado.
- [ ] Clic en una tarjeta → se da vuelta y muestra el resumen; Esc → vuelve al frente.
- [ ] Al cambiar el horizonte a "3 - 10 años" cambian los bloques de la cadena y la línea de tiempo marca "largo".
- [ ] Clic en un bloque → abre el panel lateral con portada, nombre, tema, horizonte, resumen y fuentes; no aparece "grande", "chica" ni "capacidad".
- [ ] "Leer la noticia original ↗" abre la URL de la fuente en una pestaña nueva.
- [ ] El panel se cierra con X, con Esc y con clic afuera, y las flechas anterior/siguiente recorren las tendencias.
- [ ] Cada ticket muestra AR, BR, MX, US y EU (o "s/d") y un pie "TOTAL BRECHA" con estado coloreado.
- [ ] A 375 px de ancho no hay scroll horizontal y el panel ocupa la pantalla completa.
- [ ] Con "reducir movimiento" emulado no se anima la lluvia ni el brillo holográfico.
- [ ] Ninguna imagen se ve rota (las portadas faltantes se reemplazan por la imagen de respaldo) y el crédito de Unsplash es visible.
- [ ] `npm run build` del dashboard termina sin errores y la consola del navegador no muestra errores en la edición más vieja ni en la más nueva.
