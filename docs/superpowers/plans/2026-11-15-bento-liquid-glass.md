# Rediseño Bento · Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reordenar el dashboard en un Bento oscuro con vidrio líquido (cabecera + ticker, 4 tarjetas de tema, radar + detalle) sin tocar la carga de datos.

**Architecture:** `Radar.tsx` sigue siendo el componente cliente que tiene el estado (edición, horizonte, tema, selección). Se extraen tres piezas chicas y testeables: `Ticker.tsx`, `TarjetasTema.tsx` y `Detalle.tsx`. Los estilos siguen en `app/globals.css` con clases BEM propias, reescritas con los valores del spec.

**Tech Stack:** Next 16.4.6 (App Router), React 19, Tailwind 4.3.3 (solo `@import`), Vitest 3 + Testing Library + jsdom, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-11-15-bento-liquid-glass-design.md`

Todas las rutas son relativas a `dashboard/`.

## Global Constraints

- No se modifican `app/page.tsx`, `lib/datos.ts`, `lib/portadas.ts`, `lib/tipos.ts`, ni `data/*`.
- Fondo `#05050A` (`--fondo` y `themeColor` en `app/layout.tsx`).
- Vidrio de toda tarjeta: `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.10)`, `backdrop-filter: blur(40px)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,0.08)`.
- Orbes: cobalto y violeta, `filter: blur(≥100px)`, `opacity` entre 0.10 y 0.15, en esquinas traseras.
- Tipografía: Space Grotesk (`--font-display`) en títulos y números; Inter en texto. Se quita Fraunces.
- Título: "RADAR FINTECH", bold, `letter-spacing: -0.05em`, degradé de `#ffffff` a azul hielo (`#bfdbfe`).
- Etiquetas de horizonte exactas: "0 - 1 año", "1 - 3 años", "3 - 10 años" (ya en `HORIZONTES`).
- Badges: `adelantada` verde brillante, `pareja` gris, `atrasada` rojo/naranja tenue, `nula` → "Sin datos". Texto vía `textoEstado()`.
- Textos en español rioplatense.
- `npm test`, `npx tsc --noEmit` y `npm run lint` pasan al final de cada tarea.

## Review Focus

- Horizonte sin tendencias: el ticker muestra "No hay tendencias en este horizonte." y no rompe → test en Task 2.
- Cambio de edición con el ticker en el índice 5 y la nueva lista con 2 tendencias: el índice no queda fuera de rango → test en Task 2 (reinicio al cambiar `lista`).
- Tendencia sin ninguna portada: el detalle no muestra un hueco de imagen → test en Task 4.
- Tema con brecha `null` en una región: badge "Sin datos" → test en Task 3.
- `prefers-reduced-motion`: el ticker no rota solo y el scroll es instantáneo → test en Task 2 y regla CSS en Task 6.

---

### Task 1: Ayudantes de vista

**Files:**
- Modify: `lib/vista.ts`
- Test: `lib/vista.test.ts`

**Interfaces:**
- Produces: `NOMBRE_CAPACIDAD: Record<Capacidad, string>` = `{ grande: 'Empresas grandes', chica: 'Empresas chicas', ambas: 'Grandes y chicas' }`; `fuentesDeTema(corrida: Corrida, tema: TemaId): string[]` (URLs únicas: primero `referencia` del tema, después `celdas` del tema; mismo orden que hoy arma `Detalle` en `Radar.tsx`).

- [ ] **Step 1: Tests**

```ts
it('names investment capacity', () => {
  expect(NOMBRE_CAPACIDAD.grande).toBe('Empresas grandes');
  expect(NOMBRE_CAPACIDAD.ambas).toBe('Grandes y chicas');
});
it('collects unique source urls for a topic', () => {
  const urls = fuentesDeTema(corrida, 'pagos_instantaneos');
  expect(new Set(urls).size).toBe(urls.length);
  const ref = [...new Set(corrida.referencia.filter((r) => r.tema === 'pagos_instantaneos').map((r) => r.url))];
  expect(urls.slice(0, ref.length)).toEqual(ref);
});
```

- [ ] **Step 2:** `npx vitest run lib/vista.test.ts` → FAIL (no exportados).
- [ ] **Step 3:** Implementar ambos en `lib/vista.ts`.
- [ ] **Step 4:** `npx vitest run lib/vista.test.ts` → PASS.
- [ ] **Step 5:** `git commit -m "feat: ayudantes de capacidad y fuentes por tema"`

### Task 2: Ticker de tendencias en auge

**Files:**
- Create: `components/Ticker.tsx`, `components/Ticker.test.tsx`

**Interfaces:**
- Consumes: `Tendencia`, `NOMBRE_TEMA`, `claveTendencia`.
- Produces: `export default function Ticker({ lista, onAbrir }: { lista: Tendencia[]; onAbrir: (t: Tendencia) => void })`. Raíz `<div className="ticker">`; la tendencia visible es un `<button className="ticker__item">` con nombre y tema. Constante exportada `INTERVALO_TICKER = 4000`.

- [ ] **Step 1: Tests** (con `vi.useFakeTimers()`, datos de `data/ultima-corrida.json`)

```tsx
it('rota cada 4 s y vuelve a la primera')        // +4000 ms → lista[1].nombre; tras lista.length*4000 → lista[0]
it('se frena con el mouse encima')               // mouseEnter(.ticker); +8000 → lista[0]; mouseLeave; +4000 → lista[1]
it('reinicia al cambiar la lista')               // avanzar a índice 2; rerender con lista de 1 → muestra su [0]
it('abre la tendencia visible al hacer click')   // click .ticker__item → onAbrir(lista[0])
it('sin tendencias muestra aviso')               // lista [] → "No hay tendencias en este horizonte."
it('no rota con movimiento reducido')            // matchMedia('(prefers-reduced-motion: reduce)').matches = true; +8000 → lista[0]
```

- [ ] **Step 2:** `npx vitest run components/Ticker.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar. Índice en `useState`; `setInterval` en `useEffect` dependiente de `[claves, pausado]`, donde `claves = lista.map(claveTendencia).join()`; volver a 0 cuando cambia `claves`. Fade corto al cambiar (`key` = clave + clase CSS).
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** `git commit -m "feat: ticker de tendencias en auge"`

### Task 3: Tarjetas de tema con brechas

**Files:**
- Create: `components/TarjetasTema.tsx`, `components/TarjetasTema.test.tsx`

**Interfaces:**
- Consumes: `Corrida`, `TemaId`, `TEMAS`, `NOMBRE_TEMA`, `NOMBRE_REGION`, `textoEstado`.
- Produces: `export default function TarjetasTema({ corrida, tema, onTema }: { corrida: Corrida; tema: TemaId; onTema: (t: TemaId) => void })`. Raíz `<div className="temas" role="radiogroup" aria-label="Tema">`; cada tarjeta `<button role="radio" aria-checked className="tarjeta tema">` con título y dos filas (`NOMBRE_REGION.LATAM`, `NOMBRE_REGION.GLOBAL`), cada una con `<span className="etiqueta etiqueta--{estado ?? 'nula'}">`. El componente `Etiqueta` se mueve aquí desde `Radar.tsx`.

- [ ] **Step 1: Tests**

```tsx
it('muestra una tarjeta por tema')        // 4 radios con los textos de NOMBRE_TEMA
it('marca el estado con su clase')        // por tema: existe .etiqueta--{estado_regional ?? 'nula'} con textoEstado(estado, brecha)
it('sin datos muestra "Sin datos"')       // corrida clonada con estado_global y brecha_global null → .etiqueta--nula "Sin datos"
it('elige el tema al hacer click')        // click "Stablecoins" → onTema('stablecoins'); el activo tiene aria-checked="true"
```

- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** PASS.
- [ ] **Step 5:** `git commit -m "feat: tarjetas de tema con badges de brecha"`

### Task 4: Panel de detalle

**Files:**
- Create: `components/Detalle.tsx`, `components/Detalle.test.tsx`
- Modify: `components/Radar.tsx` (borrar la función `Detalle` interna e importar la nueva)

**Interfaces:**
- Consumes: `NOMBRE_CAPACIDAD`, `fuentesDeTema` (Task 1), `Portada`, `HORIZONTES`, `dominio`.
- Produces: `export type Seleccion = { tipo: 'tema'; tema: TemaId } | { tipo: 'tendencia'; clave: string }` y `export default function Detalle({ corrida, sel, onTema, portadas }: { corrida: Corrida; sel: Seleccion; onTema: (t: TemaId) => void; portadas: Portadas })`. Raíz `<aside id="detalle" className="tarjeta detalle">`.

- [ ] **Step 1: Tests**

```tsx
it('tendencia: muestra portada, horizonte y capacidad') // portadas con la url de su 1.ª fuente → img.detalle__portada; textos NOMBRE_CAPACIDAD[t.capacidad] y hz.etiqueta
it('tendencia sin portada no deja hueco')               // portadas {} → no hay .detalle__portada
it('fuentes en pills con dominio y flecha')             // cada fuente → a.pill-fuente[href=url][target=_blank] con dominio(url) y "↗"; sin <q> ni <time>
it('tema: muestra inversión y sus fuentes')             // texto t.inversion; cantidad de .pill-fuente = min(fuentesDeTema().length, 8)
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar. Fuentes de tendencia y de tema usan la misma lista `<ul className="pills-fuentes">`. La capacidad va como píldora junto al horizonte. Se conserva el botón "← Ver el tema …".
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `git commit -m "feat: detalle con capacidad, portada y fuentes en pills"`

### Task 5: Nueva estructura de la página

**Files:**
- Modify: `components/Radar.tsx`, `app/layout.tsx`
- Delete: `components/Carrusel.tsx`
- Test: `components/Radar.test.tsx` (crear)

**Interfaces:**
- Consumes: `Ticker`, `TarjetasTema`, `Detalle`, `Seleccion` (Tasks 2–4).

Estructura del JSX (clases usadas en Task 6):

```
.pagina > .orbes (.orbe--cobalto, .orbe--violeta)
  header.bento-cabecera
    .tarjeta.marca → h1.marca__titulo "RADAR FINTECH", p.marca__bajada "Pagos y billeteras · Argentina", <Segmentado horizonte>
    .tarjeta.auge  → p.rotulo "Tendencia en auge", <Ticker lista onAbrir>, label.selector (edición)
  <TarjetasTema>   (fila de 4)
  main.bento-inferior
    section.tarjeta.radar → <MapaRadar …> (sin la leyenda de regiones)
    <Detalle>
  footer.pie → totales, aviso provisorio (si corrida.provisorio), "Generado el …"
```

- [ ] **Step 1: Tests**

```tsx
it('al tocar la tendencia del ticker abre el detalle y desplaza hasta él')
// Element.prototype.scrollIntoView = vi.fn(); render <Radar ediciones={[corrida]} />; click .ticker__item
// → #detalle contiene el nombre; scrollIntoView llamado con { behavior: 'smooth', block: 'start' } (sin depender del ancho)
it('al tocar una tarjeta de tema también desplaza al detalle')
it('muestra totales y el aviso provisorio en el pie') // corrida con provisorio: true → "Resúmenes provisorios"
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar. `elegir()` llama siempre a `scrollIntoView` (con `behavior: 'auto'` si `prefers-reduced-motion: reduce`); elegir tema desde tarjetas o radar también pasa por `elegir`. En `layout.tsx`: `Space_Grotesk` como `--font-display` (pesos 500 y 700), quitar `Fraunces`, `themeColor: '#05050A'`. Quitar imports sin uso (`Carrusel`, `NOMBRE_NIVEL`, `celdaDe`, …).
- [ ] **Step 4:** `npm test && npx tsc --noEmit && npm run lint` → todo pasa.
- [ ] **Step 5:** `git commit -m "feat: estructura Bento con ticker, tarjetas de tema y scroll al detalle"`

### Task 6: Estética Liquid Glass y radar

**Files:**
- Modify: `app/globals.css` (reescritura), `components/MapaRadar.tsx`

- [ ] **Step 1: CSS.** Reescribir `globals.css` manteniendo `@import "tailwindcss"`, tokens en `:root` y las Global Constraints. Borrar reglas de clases que ya no existen (`.cabecera*`, `.carrusel*`, `.tendencias`, `.mundo*`, `.fuentes*`, `.grano`, `.orbe--indigo`). Grillas:
  - `.bento-cabecera`: 2 columnas `minmax(0,1.6fr) minmax(0,1fr)`.
  - `.temas`: 4 columnas; ≤ 900 px 2; ≤ 520 px 1.
  - `.bento-inferior`: 2 columnas `minmax(0,1.1fr) minmax(0,1fr)`; ≤ 760 px una columna.
  - `.pills-fuentes`: `repeat(2, minmax(0,1fr))`; `.pill-fuente` en vidrio, `border-radius: 999px`, dominio con ellipsis y ↗ a la derecha.
  - `.etiqueta--adelantada` verde con brillo suave, `--pareja` gris, `--atrasada` rojo/naranja tenue, `--nula` borde punteado.
  - `@media (prefers-reduced-motion: reduce)`: sin animación del ticker ni del barrido.
- [ ] **Step 2: Radar.** En `MapaRadar.tsx`: centro más brillante (gradiente radial con opacidad alta en el centro que cae hacia afuera) y anillos con opacidad decreciente por horizonte (`corto` 0.5, `mediano` 0.3, `largo` 0.15, vía `data-horizonte` + CSS). Los ejes quedan como divisorias de los 4 temas con trazo `rgba(255,255,255,0.08)`.
- [ ] **Step 3: Verificar.** `npm test && npx tsc --noEmit && npm run lint`. Abrir el preview (`.claude/launch.json`), consola sin errores, captura en escritorio y en 375 px, y comprobar que tocar el ticker baja al detalle.
- [ ] **Step 4:** `git commit -m "feat: estética Liquid Glass y radar con anillos que se apagan"`
