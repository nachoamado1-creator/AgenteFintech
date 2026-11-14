# Estética del dashboard (13/11/2026)

Reemplaza el estilo "blanco hueso y pastel" del diseño original. Pedido del grupo: nivel Apple / Linear / Vercel.

- **Disposición bento:** grilla CSS de 12 columnas con tarjetas de distinto tamaño y separación pareja (16 px). Portada grande, estado de los datos, balance de brechas, mapa, detalle fijo a la derecha, tendencias y metodología. En tablet pasa a 2 columnas y en celular a 1.
- **Vidrio líquido oscuro:** fondo `#09090B`; tres manchas de luz azul (`#2563EB`, `#3B82F6`) y violeta (`#7C3AED`, `#8B5CF6`) con `blur(100px)` que se mueven lento. Tarjetas con fondo `rgba(255,255,255,0.03)`, `backdrop-filter: blur(20px) saturate(150%)`, borde `rgba(255,255,255,0.08)` y esquinas de 24 px. Sin íconos de monedas ni manos.
- **Selector de horizontes:** píldora arriba con "0 - 1 año", "1 - 3 años", "3 - 10 años". La opción elegida es blanca con texto oscuro y se desliza; las otras quedan en gris azulado. El filtro de tipo de empresa usa el mismo control, más chico.
- **Detalles:** cursor propio (punto blanco, sin estela ni retraso; en pantallas táctiles queda el cursor normal), texto seleccionado violeta con letra blanca, hover de tarjetas con `transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1)` (sube 2 px y se enciende el borde).
- **Tipografía:** Inter. Datos clave en blanco 100 %, rótulos al 60 % y textos secundarios al 40 %.
- **Niveles de adopción:** de transparente (0) a degradado azul-violeta lleno (3). Brechas: azul si Argentina va adelantada, gris si va pareja, rosa si va atrasada.
- Respeta "reducir movimiento" del sistema.
