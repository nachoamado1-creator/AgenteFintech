# Radar Fintech Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An n8n Cloud agent that collects fintech news and hard data, classifies them with Claude by topic, region and horizon, and computes gaps; plus a public dashboard on Vercel (option B) showing them with sources.

**Architecture:** Three n8n workflows (collect+extract, consolidate, read API webhook) over n8n Data Tables. One JSON contract (`contract/radar.schema.json`) binds n8n and the dashboard. A Next.js dashboard reads the webhook with hourly revalidation and falls back to a committed snapshot file.

**Tech Stack:** n8n Cloud (via n8n MCP; Workflow SDK; Data Tables; gateway credits: Anthropic Claude Sonnet, Brave Search, Firecrawl), Next.js App Router + TypeScript + Tailwind, Vitest + Testing Library, Ajv (schema validation), Vercel, GitHub.

**Spec:** `docs/superpowers/specs/2026-11-13-radar-fintech-design.md` (read sections 2, 4, 5 and 9 before any task).

## Global Constraints

- All user-facing text in Spanish (Argentina). No emojis.
- Topics (ids): `pagos_instantaneos`, `open_finance`, `stablecoins`, `ia_aplicada`.
- Regions in cells: `AR`, `LATAM` (Brasil/México), `GLOBAL` (EE.UU./UE). Ficha regions: `AR`, `BR`, `MX`, `US`, `EU`, `GLOBAL`.
- Adoption scale: 0 Nada · 1 Pilotos · 2 Adopción temprana · 3 Mayoría; `null` = "Sin datos".
- Horizons: `corto` (0–1 año), `mediano` (1–3), `largo` (3–10).
- Gap = nivel AR − nivel referencia; <0 `atrasada`, 0 `pareja`, >0 `adelantada`; `null` if either side is null.
- LATAM/GLOBAL column level = max of its countries (spec §9.2).
- Window: fichas of last 90 days; dedupe by `url`. Max ~150 new articles per run.
- Every ficha, tendencia and celda carries at least one verifiable `url`.
- n8n credentials: gateway credits only; never ask the user for API keys.
- Dashboard style: minimalist (bone background `#F7F6F3`, borders `1px solid #EAEAEA`, pastel level colors, no Inter/Roboto), responsive at 375px.
- Before creating anything in n8n: `get_user_preferences`; build workflows with `get_workflow_sdk_reference` + `validate_workflow`.

## Review Focus

1. A feed is down or returns zero items → the run continues with the other sources and records which source failed (test in Task 3).
2. Claude returns malformed or off-schema output for one article → that article is skipped, the run does not abort (test in Task 3).
3. Quiet period: a cell has no hard data and no fichas → `null`, rendered "Sin datos", excluded from the gap (tests in Tasks 4 and 7).
4. The n8n webhook is down or returns invalid JSON → the dashboard shows the snapshot with its date and a visible notice (test in Task 6).
5. Phone width (375px) → map, timeline and detail panel readable without horizontal scroll (check in Task 7).

---

### Task 1: Repository and data contract

**Files:**
- Create: `.gitignore` (includes `.superpowers/`, `node_modules/`, `.env*`, `.next/`)
- Create: `contract/radar.schema.json`, `contract/ejemplo-corrida.json`, `contract/validar.test.ts`
- Create: `package.json` (root scripts only: `test` runs vitest)

**Interfaces:**
- Produces: JSON shape `Corrida` = `{ corrida: string(YYYY-MM-DD), generado: ISO datetime, totales: { noticias: int, fuentes: int, fuentes_fallidas: string[] }, celdas: Celda[], temas: Tema[], tendencias: Tendencia[], referencia: Referencia[] }` with field names exactly as spec §4 and §9 (`estado_regional`, `estado_global`, `capacidad: "grande"|"chica"|"ambas"`, `adopcion: 0|1|2|3|null`, `origen: "dato_duro"|"estimado"|"sin_datos"`). Tendencia also has `fuentes: {url, fuente, fecha, cita}[]`.

- [ ] **Step 1:** `git init`, create `.gitignore`, ask the user to create an empty GitHub repo `radar-fintech` and give its URL; add it as `origin`.
- [ ] **Step 2: Write the failing test** `contract/validar.test.ts`: `ejemplo-corrida.json is valid against radar.schema.json` (Ajv, strict), `rejects a celda with adopcion 4`, `rejects a tendencia without fuentes`.
- [ ] **Step 3:** Run `npx vitest run contract` → FAIL (files missing).
- [ ] **Step 4:** Write the schema and a realistic example run (12 celdas, at least 1 `null` cell, 2 tendencias per tema), marked `"ejemplo": true` at the root.
- [ ] **Step 5:** Run `npx vitest run contract` → PASS.
- [ ] **Step 6:** Commit `feat: contrato de datos del radar`.

### Task 2: Reference table (hard data) in n8n

**Files:**
- Create: `n8n/referencia.csv`, `contract/metodologia.md`

**Interfaces:**
- Produces: n8n Data Table `radar_referencia` columns `tema, region (AR|BR|MX|US|EU), valor, que_mide, anio, nivel (0-3), justificacion, url`; `contract/metodologia.md` (cut-offs per tema, used in Task 7).

- [ ] **Step 1:** Research real values (BIS Red Book/CPMI briefs, BCRA Informe de Pagos Minoristas, BCB Pix and Open Finance, Global Findex, BCE, ITBA/Cámara Fintech): at least one row per tema for AR, one LATAM country and one GLOBAL country (≥ 12 rows), each with real URL, year, what it measures, level and one-line justification.
- [ ] **Step 2:** Write cut-offs per tema into `contract/metodologia.md` and save rows in `n8n/referencia.csv`.
- [ ] **Step 3:** Create the Data Table and load rows (`create_data_table`, `add_data_table_rows`).
- [ ] **Step 4: Verify:** `get_data_table_rows` returns ≥ 12 rows, every `url` starts with `https://`, every `nivel` in 0–3, every tema has AR, LATAM and GLOBAL rows.
- [ ] **Step 5:** Commit `feat: datos de referencia por país`.

### Task 3: Workflow "Radar · 1 Recolectar y extraer"

**Interfaces:**
- Produces: Data Table `radar_fichas` columns `corrida, tema, region, tendencia, adopcion, horizonte_ar, proveedores, inversion, capacidad, indicador, cita, url (unique), fuente, fecha`; returns `{ corrida, noticias, fuentes, fuentes_fallidas }`.

- [ ] **Step 1:** Check which RSS feeds exist today for each source in spec §4 (HTTP GET candidate feed URLs); record working feeds and those routed to Brave Search in `n8n/fuentes.md`.
- [ ] **Step 2:** Build the workflow with sticky-note sections matching the 7 steps of `docs/diseno/flujo-agente.html`: Schedule (Mondays 08:00 America/Argentina/Buenos_Aires) + Manual trigger → RSS reads ("continue on fail") + Brave Search → merge → filter (last 90 days, keywords es/pt/en per tema, skip URLs already in `radar_fichas`, cap 150) → Claude Sonnet with structured output parser (`tema: "ninguno"` → drop) → insert into `radar_fichas` → Execute Workflow "Radar · 2 Consolidar".
- [ ] **Step 3:** Extraction prompt rules: horizon by content (source type is a hint); `cita` verbatim from title/summary; `capacidad` from investment signals; region `GLOBAL` only for global trends; other countries → drop.
- [ ] **Step 4: Test** with `prepare_workflow_pin_data` + `test_workflow`: (a) 3 valid articles → 3 fichas with all fields and url; (b) article about Chile → dropped; (c) duplicate URL → inserted once; (d) one feed erroring → run succeeds, `fuentes_fallidas` lists it; (e) parser failure on one item → others still inserted.
- [ ] **Step 5:** Run once for real; record credit usage in `n8n/fuentes.md`; lower the cap if needed.
- [ ] **Step 6:** Export to `n8n/workflows/1-recolectar.json`; commit `feat: agente recolecta y extrae fichas`.

### Task 4: Workflow "Radar · 2 Consolidar"

**Interfaces:**
- Consumes: `radar_fichas`, `radar_referencia`.
- Produces: Data Tables `radar_celdas`, `radar_temas`, `radar_tendencias` (replaced each run) with Corrida fields from Task 1.

- [ ] **Step 1:** Pure functions in `n8n/code/brecha.js` (pasted into a Code node): `nivelColumna(niveles: (number|null)[]): number|null` (max of non-null; null if none); `brecha(ar, ref): number|null`; `estado(b): "atrasada"|"pareja"|"adelantada"|null`; `nivelCelda(datoDuro: number|null, fichas: number[]): {adopcion, origen}` (hard data first; else mode of fichas, ties → lower; else `null`/`sin_datos`).
- [ ] **Step 2: Failing tests** `n8n/code/brecha.test.js`: `nivelColumna([2,3])===3`, `nivelColumna([null,null])===null`, `brecha(0,2)===-2`, `estado(-2)==="atrasada"`, `estado(0)==="pareja"`, `brecha(null,2)===null`, `nivelCelda(null,[1,2,2])` → `{adopcion:2, origen:"estimado"}`, `nivelCelda(3,[1])` → `{3,"dato_duro"}`, `nivelCelda(null,[])` → `{null,"sin_datos"}`.
- [ ] **Step 3:** Run → FAIL; implement; run → PASS.
- [ ] **Step 4:** Build workflow: fichas of last 90 days → per tema Claude groups into ≤ 5 tendencias (`nombre`, `horizonte_ar`, `capacidad`, `resumen`, supporting ficha urls that must exist in input) → Code node computes celdas/brechas → Claude writes 2–3 line `resumen` per tema citing fichas → clear and write the three tables.
- [ ] **Step 5: Test** with pinned data: empty cell → `sin_datos`; tendencia citing a URL not in input is rejected; both estados present per tema.
- [ ] **Step 6:** Export to `n8n/workflows/2-consolidar.json`; commit `feat: consolidación y cálculo de brechas`.

### Task 5: Workflow "Radar · 3 API" (read webhook)

**Interfaces:**
- Produces: `GET` webhook → `Corrida` JSON (Task 1 contract), CORS `*`, read-only. Dashboard env var: `RADAR_API_URL`.

- [ ] **Step 1:** Build Webhook (GET) → read tables + latest totals → assemble Corrida → Respond to Webhook.
- [ ] **Step 2:** Publish workflows 1 (schedule) and 3.
- [ ] **Step 3:** Create `scripts/exportar-corrida.mjs`: fetch `RADAR_API_URL`, validate with the schema, write `dashboard/data/ultima-corrida.json`; exit non-zero if invalid.
- [ ] **Step 4: Verify:** `node scripts/exportar-corrida.mjs` exits 0; add test `ultima-corrida.json is valid` to `contract/validar.test.ts` and run → PASS.
- [ ] **Step 5:** Export to `n8n/workflows/3-api.json`; commit `feat: API del radar y snapshot`.

### Task 6: Aesthetics checkpoint + dashboard data layer

**Files:**
- Create: `dashboard/` (Next.js App Router, TS, Tailwind), `dashboard/lib/datos.ts`, `dashboard/lib/datos.test.ts`, `docs/diseno/estetica.md`

**Interfaces:**
- Produces: `obtenerCorrida(): Promise<{ corrida: Corrida, origen: "en_vivo"|"respaldo" }>`.

- [ ] **Step 1: Checkpoint with the user (no code):** show a refreshed option-B mockup with the real data from Task 5 in the visual companion, collect the aesthetic changes they want, record them in `docs/diseno/estetica.md`. Do not continue until the user approves.
- [ ] **Step 2:** Scaffold Next.js in `dashboard/` (non-interactive flags); add Vitest, Testing Library, Ajv.
- [ ] **Step 3: Failing tests:** `returns en_vivo when the API responds with a valid run`; `returns respaldo when fetch throws`; `returns respaldo when the API returns JSON that fails the schema`.
- [ ] **Step 4:** Implement with `fetch(process.env.RADAR_API_URL, { next: { revalidate: 3600 } })`, schema check, fallback to snapshot. Run → PASS.
- [ ] **Step 5:** Commit `feat: capa de datos del dashboard con respaldo`.

### Task 7: Dashboard UI (option B)

**Files:**
- Create: `dashboard/app/page.tsx`, `dashboard/app/metodologia/page.tsx`, `dashboard/components/{Encabezado,MapaBrechas,LineaTiempo,PanelDetalle,FiltroEmpresa}.tsx` + `*.test.tsx`

**Interfaces:**
- Consumes: `obtenerCorrida()`, `contract/metodologia.md`, `docs/diseno/estetica.md`.

- [ ] **Step 1: Failing tests:** Encabezado shows `"142 noticias de 14 fuentes"` from totales plus run date, and a notice when `origen==="respaldo"`; MapaBrechas renders 12 cells, a `null` cell reads "Sin datos", each tema shows two tags ("vs región", "vs EE.UU./UE"); LineaTiempo puts tendencias in three lanes by horizonte; PanelDetalle lists every fuente as a link with fecha and shows proveedores, inversión, indicadores; FiltroEmpresa "chica" dims tendencias with `capacidad==="grande"` but keeps them visible.
- [ ] **Step 2:** Run → FAIL; implement following the minimalist style and `estetica.md`; run → PASS.
- [ ] **Step 3:** Metodología page renders `contract/metodologia.md` (sources, scale, cut-offs, horizons, gap formula, limitations).
- [ ] **Step 4: Verify in browser** (`npm run dev`, built-in browser): desktop and 375px, click a cell and a tendencia, toggle filter; save screenshots to `docs/capturas/` for the report.
- [ ] **Step 5:** Commit `feat: dashboard mapa de brechas, línea de tiempo y detalle`.

### Task 8: Deploy and end-to-end run

- [ ] **Step 1:** Push to GitHub; guide the user click by click to import the repo in Vercel (root `dashboard/`) and set `RADAR_API_URL`.
- [ ] **Step 2:** Trigger workflow 1 manually; confirm 2 and 3 update; run `scripts/exportar-corrida.mjs`, commit snapshot, push.
- [ ] **Step 3: Verify:** public URL loads without login, shows the new run date, 5 spot-checked source links open real pages, page works on a phone.
- [ ] **Step 4:** Write `README.md` (Spanish): what each piece is, how to re-run the agent, how to refresh the snapshot, URLs. Commit `docs: guía de uso`.
