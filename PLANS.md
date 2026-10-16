# V1 Dashboard Implementation Plan

## 2026-10-16 — Readable typography and light-first Ember (authorised implementation)

Publication verification: user requested push to `Amjadh23/DDN-Dashboard`, branch `design/ember-theme`. Remote tip matched the starting commit `893360a`. Fresh checks passed: formatting, zero-warning lint, strict types, production build, 42/42 unit tests, 7/7 isolated database tests and the complete 63/63 browser suite (3.2 minutes). Commit includes the bounded R1 source/tests/report; generated artifacts remain local.

R1 COMPLETE (implementation and automated validation; stakeholder acceptance pending). User explicitly requested brainstorming followed by implementation of larger typography for older readers and a polished light/dark palette with light as the default. Selected design: near-white warm canvas, white cards with defined edges, restrained warm accents and shadows; darker orange for text/actions; preserve the Ember illustrations and dark identity areas. Target 16px reading/form text and at least 14px supporting HTML text, relative units, flexible controls and responsive layouts. Explicit theme cookie overrides a light first-visit default regardless of OS preference. No data, policy, map classification, access, route or workflow changes.

Work in the existing `codex/current-app-2026-10-15` checkout at `893360a`; preserve untracked artifacts. Files: existing four CSS layers, root layout, theme toggle, browser design/readability tests, this log and a validation report. No dependencies. Contract trace: FR-009, VIS-001/002, MAP-028/029, NFR-020/021/022/023/024, ACC-006/007/010. Existing missing `requirements.md` and full-V1 governance/manual acceptance limitations remain.

Validation: first demonstrate failing light-default/readability browser checks; implement; run bundled Node equivalents of format:check, lint, strict types, 42 unit tests, production build, isolated database/browser tests. Run typecheck after the build to avoid `.next/types` regeneration races. Port 3100 belongs to another local site: use ignored temporary copies of the existing isolated runner/config on 3210, preserving provision/cleanup and isolation guards. Review 1440/390/320px screenshots in both modes, 200% zoom, AIDA, tables, forms, map and source disclosure; axe contrast/reflow checks. Stop for any data/security change or unresolved validation failure. Record concrete results before completion.

R1 results: initial new default/readability tests failed as expected. Production build, strict types, zero-warning lint, formatting, unit 42/42 and isolated DB 7/7 passed. Full browser run 62/63; the remaining CSS-zoom test was an invalid browser-zoom model (media queries do not change). Corrected to a 720×500 CSS viewport at 2× density for a 1440×1000 display at 200%; final rebuilt targeted readability + workflow suite 7/7 passed. All 12 routes × 3 widths × 2 themes rendered HTTP200 without horizontal page overflow, with desktop axe scans in both modes and additional overview/AIDA mobile scans. Screenshot review refined mobile map controls, Teras cards and nested upload-panel padding. Latest production build/types/format passed; preserved existing demo DB and untracked artifacts. Preview verified HTTP200 and light default at http://127.0.0.1:3220. No commit/push in this milestone. Exact files, command arguments, outputs, evidence status and limitations: docs/READABILITY_AND_THEMES.md. Next: older-reader stakeholder review; manual screen-reader, browser zoom and print acceptance remain deferred.

## 2026-10-15 — Ember identity, light/dark modes and interactive map (authorised implementation)

User request: replace the charcoal/blue look with a professional warm theme (orange suggested), new font, project-related illustrated avatars, a more interactive map and a light/dark switch, keeping all functionality. Bounded milestone E1 on branch `design/ember-theme`. Presentation only: no route, DAL, authorisation, disclosure, data, schema or classification change.

Design: "Ember" identity: warm ivory canvas with white cards (light) and ember-night surfaces (dark); ember orange accent `#e8552a`/`#ff7a45`; Plus Jakarta Sans via `next/font`. Mode follows the operating system until the header switch is used; the choice is a `ddn-theme` preference cookie read by the root layout (no flash, no browser storage). Hard-coded colours in `globals.css` and `reference-*.css` were converted once into `light-dark()` pairs (OKLCH lightness inversion for light mode; blue accents re-hued to ember, neutrals warmed; print blocks untouched); 6–10px text raised to a 9–11.5px floor. `src/app/ember.css` hand-styles shell, hero, cards, filters, map and AIDA. Sidebar, hero and featured cards render with a dark colour-scheme in both modes. Decorative SVG characters (`src/components/illustrations.tsx`): one per Teras, one per demo profile and a redrawn AIDA (`public/aida-avatar.svg`, same path); all `aria-hidden`, fictional and varied.

Map: hover/focus card with value, unit, band and evidence label (replaces native titles; values moved into each state's accessible name); Ctrl/⌘ + scroll or pinch zoom at the cursor, drag to pan, double-click zoom, search flies to the state, zoom level readout; hover outline, selected outline and pin; legend bands are toggle buttons that dim states outside the band; staggered entrance and fill transitions with reduced-motion fallbacks. Data colours (`demo-relative-range-v1`, supplied relative rates, continuous rate scale) are unchanged; neutral fills (zero, not applicable, unknown, suppressed, not collected, count land) now follow theme tokens shared with the legend. MAP-010/011/014/022 safeguards retained.

Files: `src/app/layout.tsx`, `src/app/ember.css` (new), `src/app/globals.css`, `src/app/reference-theme.css`, `src/app/reference-components.css`, `src/app/page.tsx`, `src/app/teras/[id]/page.tsx`, `src/components/app-shell.tsx`, `src/components/ui.tsx`, `src/components/theme-toggle.tsx` (new), `src/components/illustrations.tsx` (new), `src/components/threat-map.tsx`, `public/aida-avatar.svg`, `tests/e2e/design.spec.ts`, `tests/e2e/map.spec.ts`. Also on this branch: `next` and `eslint-config-next` 16.3.4 → 16.4.0 (npm audit: RCE/SSRF/cache-poisoning advisories; remaining 5 high are lint-tooling-only `braces` chain).

Validation: lint (zero warnings), strict typecheck, unit/contracts 42/42, production build, isolated PostgreSQL/PostGIS 7/7 and the complete production browser suite (59 tests incl. new theme-switch and map-interaction tests; axe WCAG 2.2 AA at 1440/390/320 px in light and dark) passed. First full run 50/59: contrast of one snapshot label, heat-map/chart fills mixed toward a fixed dark navy, and one changed accessible name; fixed (theme-surface mixes, original state names restored with values in SVG <desc>) and rerun 59/59. Scripted checks: hover card values, band dimming, zoom/pan/Ctrl+scroll, search fly-to; no horizontal overflow on 12 routes at 390/320 px; visual review of all routes in both modes.

Limitations: `npm run format:check` reports `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` only because this Windows checkout uses CRLF (`core.autocrlf=true`); content unchanged. Manual spoken screen-reader acceptance and print-layout refinement remain deferred as before. Next: stakeholder visual review of both modes.

## 2026-10-07 — Annual relative-rate colours

A1 COMPLETE, user authorised: apply green/amber/red equal-interval relative-rate colours to supplied 2024–2025 burden data only. Positive disclosed rate min–max divided in thirds, version supplied-relative-range-v1, effective 7 October 2026; legend explicitly labels visual method DEMO and source data supplied, not official threat zoning. Existing zero/missing/suppression/count/confidence controls remain. 2021–2023 rates unavailable without same-year denominators. MAP-010/011/014/022 preserved. Validation: palette tests3/3, isolated DB7/7, targeted annual/design/map browser15/15, formatting, lint, production build (including strict types) passed. Initial browser14/15 and lint exposed remaining demo-only wording; corrected and rerun. Captured annual2024/2025 screenshots; refreshed local app against unchanged demo DB. Files changed: SPEC.md approved visual-method clarification, PLANS.md, src/lib/domain/map-palette.ts, src/components/threat-map.tsx, src/components/mock-assistant.tsx, tests/unit/map-palette.test.ts, tests/e2e/design.spec.ts. Commands: direct bundled Node CLI prettier --write/--check on changed code, eslint src tests scripts --max-warnings0, tsx --test tests/unit/map-palette.test.ts, next build --webpack, tsx --env-file=.env.local scripts/e2e.ts design.spec.ts annual.spec.ts map.spec.ts. Outputs: artifacts/screenshots/relative-rates-2024.png and relative-rates-2025.png. Data: supplied BMD annual counts plus same-year DOSM denominators; rates Derived, classification method DEMO. No database mutation or source data change. Missing requirements.md, manual screen-reader/official thresholds and existing print-layout limitations retained. Next: stakeholder visual review.

## 2026-10-07 — Vercel visual reference and mock AIDA (authorised implementation)

User requests exact chatbot and colour elements from https://ddndashboard.vercel.app/. Bounded milestone V1 COMPLETE: reproduce observed CSS theme, gradient/sidebar mission card, source-provided emblem and AIDA avatar, launcher, modal panel, chips, message bubbles, reset and composer. Preserve Scenario Semasa consolidation, annual periods, DAL/access/disclosure, routes and workflows. AIDA is a deterministic local mock, session-memory only, with navigation/help responses; no generative model, external requests, sensitive dataset access or persistence. Match the supplied reference's versioned `demo-relative-range-v1` colour rule for synthetic rate maps only (positive displayed range split into three equal intervals; green #268963, amber #e4bd43, red #d24b5c). This is adoption of the user-supplied visual method, not an invented official threshold. Disclose dynamic boundaries/formula/version and text/icons; zero, unavailable and suppressed states are excluded. Supplied annual rates and confidence retain continuous blue shading; count views use separate workload symbols. Official thresholds/composites remain disabled. Evidence: reference screenshot, computed styles, rendered legend method and downloaded public stylesheet; attribution in docs/VERCEL_DESIGN_MATCH.md, no protected source-register edit.

Validation: failing browser regression before implementation; then direct bundled Node CLI equivalents of format:check, lint, typecheck, test:unit, build and complete test:e2e (isolated PostgreSQL/PostGIS/browser suite). Test exact reference tokens/assets, mock open/close/reset/chips/text, no message network/storage, keyboard trap/return, source versus demo map colouring, disclosure and 1440/390/320px axe/reflow/screenshots. Stop if the design requires live AI, sensitive data, official classification or lost existing capabilities. requirements.md remains missing. Next: user review of the matched design.

V1 validation log: reference-token regression failed before implementation; targeted design/accessibility/overview run passed 21/22 with one overly broad navigation selector corrected. Initial full suite passed 52/58: reference opacity entrance animation caused transient badge contrast failures. Retained movement, removed opacity fade, then final production browser suite passed 58/58 (2.0m), isolated PostgreSQL/PostGIS 7/7, unit/contracts 41/41, formatting, zero-warning lint, strict types and production build passed. Visual QA 39 route/viewport captures all HTTP200 with zero runtime errors/overflow. Refreshed user localhost tab and visually inspected desktop/mobile AIDA plus Scenario Semasa. Print map PDF and screenshot generated, with demo method metadata. Existing demo database retained; no live import/reseed/reset. Files, command arguments, reference assets, requirement trace, evidence statuses and limitations: docs/VERCEL_DESIGN_MATCH.md. Requirements covered are FR-001/002/003/009/010 presentation and map/accessibility safeguards; no full V1 acceptance inferred. Next: stakeholder review of the reference match; manual spoken screen-reader acceptance and official threshold governance remain deferred.

## 2026-10-07 — Scenario Semasa consolidation (authorised implementation)

User decision: combine Gambaran nasional and Peta strategik into one page named exactly `Scenario Semasa`. Bounded milestone S1 COMPLETE: retain the supplied executive snapshot and five Teras links at `/`, integrate the full map workspace (five layers, count/rate, comparison, search/zoom, ranked table, drivers, methodology and contextual actions), use one shared filter bar and one navigation entry. `/map` becomes a query-preserving compatibility redirect; internal links target `/`. The user's decision amends SPEC section 5 routing only; FR-001/002/003/009/010 and MAP capabilities remain required. Existing aggregate sources, DAL, suppression and role scope are retained. `requirements.md` remains missing; unrelated artifacts/user work preserved.

Validation: direct bundled Node equivalents of package scripts, because npm shim cannot handle workspace ampersand: `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts overview.spec.ts map.spec.ts annual.spec.ts` (regression first), `node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs`, `node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0`, `node_modules/typescript/bin/tsc --noEmit`, `node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts`, `node_modules/next/dist/bin/next build --webpack`, complete `scripts/e2e.ts` (isolated database plus browser suite). Capture and inspect Scenario Semasa at 1440/390/320px with source details and map controls. Stop if sources, disclosure, authorization or acceptance criteria would change; no migration/import/reset is needed. Next: stakeholder review of the consolidated page.

S1 validation log: two new browser tests failed before implementation on the old heading/missing redirect. Initial targeted run 13/16; three test selectors corrected after inspecting actual accessible controls and duplicate Teras links. Final complete production browser suite 54/54 (1.5m), isolated PostgreSQL/PostGIS 7/7, unit/contracts 39/39, formatting, zero-warning lint, strict types and build passed. Captured 1440/390/320px base and expanded-source states; visually inspected desktop/mobile/reflow. Local demo restarted hidden with wrapper PID 12948 and successful HTTP smoke checks; no live records imported, reset or reseeded. Exact file list, commands, evidence, requirement trace, outputs and retained limitations: docs/SCENARIO_SEMASA.md. Next: user review; existing full-V1 governance/manual screen-reader limitations remain open.

## 2026-10-07 — PDF data in existing dashboard (authorised implementation)

Goal: populate every supported existing data point from BMD 2025 while preserving routes, layout, controls and click behaviour. User explicitly requested brainstorm then implementation; proceed without another design gate. `requirements.md` remains absent. Existing untracked `artifacts/` is preserved.

Design: annual observations are separate from the weekly snapshot and synthetic scenarios. Add annual options to the existing Tempoh selector, use the same page tree and components, and retain the current weekly default. Do not create an annual page, route, button or mode. Data access stays server-only and scoped. Source labels, dates and definitions must follow the selected observation. Missing or conflicting values never become zero. No annual-to-weekly or treatment-method-break comparison.

Mapping: overview/T2 clients and institution/community -> table 2.1; existing T1/T2 evidence tables -> 1.1,1.3–1.8,2.3–2.9,2.11; T1 programme/attendance and trend -> 4.1 family/education/workplace only (explicit partial coverage); existing T3 evidence -> 3.1,3.2,3.4,3.5,6.2; T3 seizure quantity and asset panels -> 3.2 and 3.4 with original units/stages. Source tables are evidence, never instructions. Recovery/retention/cohort funnels, satisfaction, eligibility/coverage, wait times, actual expenditure, cost per outcome, T4 harm outcomes and T5 commitments have no matching source. RM79/client/day does not match cost per output. Complaints, community prevention and inconsistent investigation/prosecution partitions remain withheld. Map source activation requires valid boundary/denominator semantics; retain its existing component and document any unfulfilled mapping rather than inventing thresholds.

Milestones:
1. Complete: mapping, selected extraction, schema/reconciliation tests and idempotent transactional importer. 25 source tables, 1,986 observations, 15 snapshots. Source hash/totals validated; isolated database tests confirm reimport inserts zero and preserves the 14 weekly observations. Live dry run confirms business counts unchanged.
2. Complete: annual records bind to existing DTOs/components and Tempoh control. Targeted browser tests pass for values, state clicks, source setting links, geography, precision, exports, permissions, mobile accessibility and catalogue. Registry/catalogue show source definitions. Same map component uses matched-source counts and same-year DOSM rates on explicitly DEMO/unapproved boundaries; other annual layers unavailable. No new routes/styles/navigation.
3. Complete: final regression, local import and restart. Formatting, lint, strict types and production build passed; 39 unit tests, 7 database tests, 46 existing browser regressions and 6 annual browser tests passed. The final annual rerun passed after the supplied-only empty-panel adjustment. Independent review cleared all three findings concerning annual titles, prevention trends and export provenance. Live import added 1,986 observations and 15 snapshots; repeat import inserted zero. Actions 4, notes 2, submissions 2, saved views 1 and demo observations 162 preserved. Restarted the local server with hidden wrapper PID 27912; annual and weekly HTTP/value smoke checks passed, with no stderr output. Exact commands and limitations are recorded in docs/BMD_EXISTING_DASHBOARD.md. Next: stakeholder review of populated existing components; unresolved source gaps remain unavailable or explicitly synthetic.

Requirement trace: FR-001/002/003/005/006/008/009/010; DATA-001/002/003/005/010/011/012/024/025/026/040/043; partial FR-T1, FR-T2, FR-T3. Evidence: supplied annual aggregates (Available), any programme sums explicitly Derived. No blanket completion claim for unresolved V1 requirements.

Stop conditions: mismatched PDF definitions/units, failed reconciliation, unauthorized data exposure, interface replacement or changes to existing business records. Existing contract files remain read-only. Final review must inspect these failure modes and annual report/export provenance.

## 2026-09-09 — Stakeholder demonstration refinement (explicitly authorised)

The attached refinement brief and completed QA are the design baseline. Same capabilities, less default interface; no new policy thresholds or production infrastructure. Existing contract inputs remain unchanged; `requirements.md` is still missing.

- [x] R1 COMPLETE — isolated E2E server on 3100 and fresh generated test database; 43/43 browser tests passed, including upload/revision. Clean demo database `dashboard_demo_refined_20260909` prepared; previous `dashboard` database and private files retained. Curated data uses actual permission/validation/approval/audit functions: four actions (one closed independently), two notes/decisions, two scanned submissions (one published), one saved report. Subsequent DB tests also use disposable isolation; cleanup is restricted to the generated test database and its private files.
- [x] R2 COMPLETE — compact, paginated registry and current-action lists; native disclosure for Teras/source/governance detail; BM presentation labels, responsibility disclosure including JKMD/MTMD, concise map limitations, mobile labelled actions and custom accessible upload chooser. Existing API contracts/security untouched. Initial 43-test regression, lint, TypeScript and production build passed. Visual inspection prompted further bounded refinements: registry pagination/deep links, collapsed action editing and human owner names; these receive fresh R3 checks.
- [x] R3 COMPLETE — final formatting, lint, strict types and production build passed; unit/contracts36/36, isolated PostgreSQL/PostGIS5/5 and full browser46/46 passed. After the last one-line compact empty-panel hook, production build/static checks passed again and focused Teras/refinement7/7 plus DB5/5 passed. Final39 route/viewport captures allHTTP200, zero runtime errors/page overflow. All13 desktop/mobile layouts inspected, with additional320px review. Registry/Actions/Uploads desktop heights reduced78%/73%/69%; Teras31–62%. Curated business counts unchanged after isolated E2E. Evidence, limitations and controlled-demo verdict: docs/DEMO_REFINEMENT.md (10 September 2026).

Commands: direct Node CLI equivalents of package scripts (npm shim fails on this ampersand-containing Windows path): prettier --check; eslint --max-warnings 0; tsc --noEmit; tsx --test tests/unit/*.test.ts; tsx --env-file=.env.local scripts/e2e.ts --database-only; tsx --env-file=.env.local scripts/e2e.ts; next build --webpack; tsx scripts/visual-qa.ts. Exact arguments and final results are in docs/DEMO_REFINEMENT.md. Next: facilitated stakeholder walkthrough and manual screen-reader acceptance; no full V1/production approval inferred.

Stop only the affected work if data/authority is missing. No district facts or official scoring are invented. Manual spoken screen-reader acceptance remains a separate evidence limitation. The user has authorised direct implementation; no additional design approval is needed. Requirement trace: FR-001..010, ACC-006/020/028, existing workflow/security acceptance checks; this refinement does not reclassify all partial V1 requirements as complete.

**Contract:** `SPEC.md`; meaning: `PROJECT_CONTEXT.md`; behaviour: `AGENTS.md`.
**Authorisation:** On 7 September 2026 the user explicitly authorised inspection, planning, implementation, browser inspection, screenshots and iterative refinement in this run.
**Goal:** Deliver the governed BM-first V1 stakeholder prototype, preserving the distinction between supplied evidence and synthetic demonstrations.
**Architecture:** Next.js 16 App Router and strict TypeScript; server-only typed DAL; PostgreSQL/PostGIS; private local quarantine and an isolated Node worker for the local demonstration. Production identity, hosting, object storage, scanning and disclosure policy require approved configuration before production use.
**Design:** Deep-navy/slate command workspace; compact navigation; restrained teal for navigation and amber/red/green only for explicitly labelled demonstration statuses; prominent geographic canvas; typography-led hierarchy; coherent accents per Teras; keyboard/table alternatives; motion opt-out.

## Inspection — repository reality

Read in the prescribed order: `AGENTS.md`, `PROJECT_CONTEXT.md`, `SPEC.md`, `REFERENCES.md`, attempted `requirements.md`, then `README.md`. The complete initial file inventory is eight files:

| File | Finding |
|---|---|
| `AGENTS.md`, `PROJECT_CONTEXT.md`, `SPEC.md`, `REFERENCES.md`, `README.md` | Present; preserved as contract inputs. |
| `requirements.md` | Absent; no substitute invented. `SPEC.md` supplies the normative requirements. |
| `data/Data_STATISTIK MINGGUAN AADK-LAPORAN 9 OGOS 2026.pdf` | Supplied 15-page weekly report; actual location differs from the contract reference. |
| `references/Dasar-Dadah-Negara-BM_compressed.pdf` | Supplied policy; actual location differs from the contract reference. |
| `references/General_SDD_ChatGPT_Codex_Workflow_Guide.md` | Supplied workflow guide; actual location differs from contract reference. |

There is no `.git` directory, source application, package manager configuration/lockfile, route, database, migration, test or deployment configuration. No `.openai/hosting.json` exists. System Node is 20.18.0; bundled Node is 24.19.0. PostgreSQL/PostGIS and Docker are not installed. No production credentials were supplied or sought.

### Decisions and boundaries

1. Use the supplied PDFs at their actual locations; do not rename/copy/modify protected source documents. Record the mapping here and in a source note. Missing discovery material does not replace the authoritative `SPEC.md`.
2. The approved contract and user's visual direction constitute the design baseline. Do not add a competing specification or pause for repeat design approval.
3. Install dependencies and, if compatible, portable PostgreSQL/PostGIS inside the workspace. Do not alter system services or global Node. If the database cannot be validated, stop that milestone rather than silently substituting SQLite or a JSON database.
4. Local demonstration identities are fictional, separate actors with server-side permissions. They confer no actual organisational authority. Production login must fail closed without a configured identity adapter.
5. Real supplied aggregate values require visual PDF reconciliation. Unsupported performance/outcome scenarios and demographic/geographic examples remain synthetic, in a separate schema, with the exact label `DEMO / SYNTHETIC` on cards, tables, charts, map details and exports.
6. State boundary source for demonstration: geoBoundaries MYS ADM1, boundary ID `MYS-ADM1-15666254`, representing 2017, OSM/Wambacher, ODbL 1.0. This is a documented demonstration boundary, not an approved national boundary baseline. No district polygons. Population denominators for illustrative rates are synthetic and labelled. No official rate is calculated using synthetic population.
7. Official threat bands/composite weights remain disabled. Demonstration classification must explain its rule and expose counts, denominators and confidence independently. Clinical recovery and reintegration composites remain unavailable until definitions are approved.
8. Disclosure policies used in the isolated synthetic demonstration are versioned demonstration policies, not approved Malaysian disclosure rules. Official sensitive uploads/publication remain unavailable until policy, scanner and identity configuration exist.
9. Work is done directly in this new workspace as authorised. No branch/commit/remote exists to inspect or modify. Keep source inputs intact.

## Milestones

States: **pending**, **active**, **complete**, **blocked**. A milestone is complete only after its specified checks pass. The progress log records exact commands/results. Implementation runs one bounded milestone at a time.

### M0 — Inspection, source reconciliation and plan — complete

- [x] Read contract and inspect complete initial structure/runtime.
- [x] Create this plan with source path discrepancies, missing discovery input, bounded work and stop conditions.
- [x] Render supplied PDF pages 1–2 and reconcile the headline real values. Extended demographic/state reconciliation and hashes continue with M1 seeding.
- [x] Verify dependency compatibility and availability of matching portable database distributions. Actual database startup/extension tests belong to M1.
- [x] Write `docs/adr/0001-local-v1-architecture.md` and `docs/source-register.md` with external-source provenance and limitations.

Files: `PLANS.md`, `docs/source-register.md`, `docs/adr/0001-local-v1-architecture.md`, `artifacts/source-review/*`, acquisition scripts only.
Validation: file inventory; Node/npm versions; PDF page count, rendered images and visual comparison; database binary versions/start/extension check. Source extraction is an aid, never authority.
Requirements supported, not yet satisfied: `ACC-008`, `ACC-023`, `NFR-001`, `NFR-006`.

### M1 — Foundation, data contracts and server policy — complete

- [ ] Pin Next 16, React, TypeScript and required dependencies; create strict config, lint/format/test scripts.
- [ ] Write failing semantic/security tests before implementation: null/zero denominators, period changes, incompatible cohorts, small-cell plus secondary suppression, unapproved thresholds, role/organisation/geography/domain/state access and self-approval.
- [ ] Implement `src/lib/domain/*` typed metric/registry/permission/disclosure contracts; all nonpublic reads pass through `src/lib/server/*`.
- [ ] Create `database/migrations/001_initial.sql`: conformed effective-dated reference dimensions, distinct supplied/synthetic facts, immutable definition/publication revisions, workflow, actions, saved views, jobs and audit. Add constraints, indexes, parameterised access and scoped queries.
- [ ] Seed visually reconciled supplied aggregates and structurally separate synthetic fixtures. Never seed personal identities or cases.
- [ ] Implement explicit local demo sessions, server-side default-deny boundary, shaped DTOs and no-store responses.
- [ ] Add unit/contract/database integration tests including spatial joins and negative scope checks.

Files: root package/config files; `src/lib/domain/*`, `src/lib/server/*`, `database/*`, `scripts/*`, `tests/unit/*`, `tests/database/*`.
Interfaces: `Session`, `Scope`, `MetricDefinition`, `Observation`, `Publication`, `MapZoneDTO`; policy returns a denied result by default; DAL returns only disclosed DTOs. Worker and pages consume the same definitions/disclosure rules.
Validation: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db`, `npm run db:seed`. Negative tests must prove inability to read a restricted organisation/geography or approve one's own submission.
Requirements: `FR-020`, `SEC-001..005`, `DATA-001..013`, `DATA-020..027`, `NFR-001..006`, `NFR-010..012`, `SEC-010..015`, `ACC-001..003`, `ACC-005`, `ACC-009`.

### M2 — Design system, overview and map — complete

- [ ] Build BM-first layout, typography, spacing/color tokens, mobile navigation, shared accessible controls and focus states.
- [ ] Implement URL filter parsing/serialization with invalid/irrelevant filters rejected or disabled with explanation; period, comparison, geography, organisation, domain, setting, evidence, unit and confidence use shared state.
- [ ] Build overview, source-supported KPI snapshot, cross-Teras summary and actions/quality panels.
- [ ] Build interactive state map: five distinct layers, count symbols versus rate choropleth, explanatory legend/method drawer, search/selection/zoom, no autoplay, state detail, ranked table and linked action context.
- [ ] Demonstrate zero, unknown, not collected, not applicable and suppressed separately. Disabled composite and district controls explain required decisions.
- [ ] Add route and interaction tests for URL persistence, disclosure, keyboard operation and material evidence labels.

Files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/map/page.tsx`, `src/app/globals.css`, `src/components/*`, `src/lib/filters.ts`, `public/geo/*`, `tests/e2e/map.spec.ts`.
Validation: unit/contract tests, strict typecheck, route smoke, keyboard map/table interactions, desktop/mobile screenshots and overflow checks.
Requirements: `FR-001..003`, `FR-009..010`, `FR-021..022`, `FR-040..042`, `VIS-001..003`, `MAP-001..032`, `NFR-020..027`, `ACC-021..025`, `ACC-028`.

### M3 — Five decision-oriented Teras pages and registry — complete

- [ ] Implement each page's purpose, responsibility classification, refresh/source metadata and needs/process/outcome/cost/satisfaction perspectives.
- [ ] T1: context, six-strategy/programme coverage, demographics, delivery funnel, need/coverage comparison and strategy matrix.
- [ ] T2: supported caseload/pathways/facilities plus separate synthetic care funnel, retention/cohort/loss-to-follow-up, outcomes, wait/occupancy and reintegration domains. Recovery remains definition-gated.
- [ ] T3: supported complaints and suspected-person arrests, separate demo supply map, legal-stage funnel, seizures with compatible units, substance/participation matrices, cycle times and asset stages. Preserve legal caveats.
- [ ] T4: demo harm map/service gap, harm trends, screening cascade, service/intervention matrix, retention/barriers. Unapproved service scope remains disabled.
- [ ] T5: partner map, lifecycle timeline, theme matrix, commitment tracker, exchange/training/practice stages, cost and satisfaction. No protected documents.
- [ ] Implement searchable Indicator Registry and Data Catalogue with complete versioned definitions, lineages, freshness, quality/coverage and ownership status.
- [ ] Add per-page acceptance/route tests and source reconciliation tests.

Files: `src/app/teras/[id]/page.tsx`, `src/components/teras/*`, `src/app/indicators/page.tsx`, `src/app/data/catalog/page.tsx`, registry/seed files, `tests/e2e/teras.spec.ts`, `tests/unit/reconciliation.test.ts`.
Validation: all five acceptance journeys, semantically distinct stages/units, source labels, all KPI definition links, responsive/visual checks, strict types and tests.
Requirements: `FR-030..031`, all `FR-T1-*..FR-T5-*`, `DATA-T1-*..DATA-T5-*`, `VIS-T1-*..VIS-T5-*`, `ACC-T1-001..ACC-T5-001`, `FR-005`, `ACC-020`, `ACC-025`.

### M4 — Controlled submissions, asynchronous validation and publication — complete

- [ ] Write failing workflow/security tests for invalid transitions, cross-scope access, scanner failure, formula injection, duplicates, self-approval and stale revisions.
- [ ] Create versioned CSV/XLSX templates with instructions and safe examples. Issue short-lived scoped upload targets; enforce byte/row/column/signature limits and private quarantine.
- [ ] Run isolated worker for scanning/parsing, structural/business validation, row/column errors, previews and downloadable diagnostics; idempotent jobs, retry/dead-letter status.
- [ ] Implement explicit source/coverage/quality attestation; independent review with required reason; atomic versioned publication; revisions preserve earlier publications and linked context.
- [ ] Make workflow state and errors visible; no simulated success for missing infrastructure. Official publication and real uploads remain gated by required approved configuration.
- [ ] Add end-to-end upload → validation → attestation → independent approval → publication → view/export → revision test.

Files: `src/app/data/uploads/*`, `src/app/api/v1/*`, `src/lib/server/workflow.ts`, `src/worker/*`, template/schema files, `tests/e2e/workflow.spec.ts`, `tests/unit/uploads.test.ts`.
Validation: `npm run worker:once`, `npm run test:unit`, `npm run test:db`, `npm run test:e2e -- tests/e2e/workflow.spec.ts`; malformed/macro/formula/oversize files rejected, scanner unavailable fails closed for arbitrary uploads.
Requirements: `FR-004`, `FR-006`, `FR-023..025`, `DATA-030..046`, `WF-001..008`, `SEC-016..018`, `NFR-007..009`, `NFR-028..029`, `ACC-004`, `ACC-026..027`.

### M5 — Collaboration, saved views, exports and scoped administration — complete

- [ ] Contextual notes/decisions and actions with owner, organisation, priority, due date, evidence and independent verified closure; retain publication/definition/filter context.
- [ ] Saved views and report/export history, approved aggregate CSV/XLSX and print/PDF view; metadata includes filters, period, classification, versions, generation time and caveats; apply same suppression and formula-injection protection.
- [ ] Recheck authorisation on generation/download; bounded/expiring download tokens and audited events.
- [ ] Scoped organisation/reference/role administration and immutable auditor view. Platform admin does not inherit business data rights.
- [ ] Check notifications contain no row data and access revocation takes effect.

Files: `/actions`, `/reports`, `/admin/*` route files; collaboration/export DAL/handlers; integration tests.
Validation: context persistence, independent closure, saved-view reproduction, export parity, reauthorisation and role matrix tests; keyboard workflows.
Requirements: `FR-007..008`, `FR-026..027`, `FR-050..056`, `WF-009..012`, `SEC-017..018`, `ACC-027..028`.

### M6 — Full acceptance, browser QA and refinement — local validation complete; acceptance pending

- [x] Run format, lint, strict types, unit/contract/database/e2e tests and production build; resolve detected defects.
- [x] Inspect all13 major routes at desktop, mobile and320px reflow in the browser.
- [x] Capture and refine route screenshots, map/chart/table presentation and print output.
- [x] Run automated accessibility, keyboard/table and reflow checks; explicitly document unperformed screen-reader/performance measurements.
- [x] Inventory all228 requirement IDs with demonstrated/conditional/partial statuses. No automatic full-contract acceptance inferred.
- [x] Create `docs/VALIDATION.md`, screenshot inspection manifest and `docs/OPERATIONS.md`; update README.
- [ ] Obtain manual screen-reader acceptance evidence for `ACC-006`; resolve any resulting defects. Full V1 acceptance remains open until this and the detailed partial requirements in the validation report are resolved by the appropriate stakeholder definitions/acceptance decisions.

Validation commands (to be implemented with these exact names):
```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:db
npm run test:e2e
npm run build
npm run start
npm run qa:visual
```
Bundled Node 24 must precede system Node in PATH for these commands. Package scripts will be recorded as they are added, with exact pinned dependency versions.
Outputs: application, migration/seed/worker scripts, tests, `artifacts/screenshots/*`, `artifacts/test-results/*`, `docs/VALIDATION.md`, updated `PLANS.md`.
Requirements: `ACC-001..010`, `ACC-020..030`, `NFR-020..029`.

## Stop conditions and stakeholder decisions

Stop the affected work and report if a required source cannot be found/read, the architecture cannot run/validate without replacement, privacy/authority is needed beyond this isolated synthetic demonstration, a real metric definition/denominator/boundary/threshold is required, a validation expectation is unknown, or a destructive action is needed. Do not silently weaken the acceptance contract.

Production blockers: actual 2026 committee hierarchy and owners; participants and approval authorities; clinical/active/new/repeat/recovery/reintegration definitions; legal comparability and harm-service scope; official populations/boundaries; threat components/thresholds; disclosure/retention/export policy; any person linkage; identity/hosting/residency/network/storage/scanner services; operations, browser/device baseline and RTO/RPO. The demo does not settle these decisions.

## Progress and validation log

### 2026-09-07 — M0 active

- Contract reading and inventory completed. `Get-Content requirements.md` failed because file is missing; recorded without invention.
- `rg --files --hidden -g '!.git' -g '!node_modules'`: eight original files, no implementation.
- `git status --short`: fatal, not a Git repository; no user work overwritten.
- `node --version`: 20.18.0; bundled Node: 24.19.0. `npm view next@16 version --json`: 16.3.4 is the newest available stable 16.x in this environment.
- Source PDF extraction via bundled `pypdf` succeeded; weekly report has 15 pages. `pdftotext` was not on PATH and `fitz` is unavailable; switched to bundled `pypdf` + Poppler, without changing source files.
- geoBoundaries API inspected; 16 state/territory units, 2017 representation; demo-only boundary baseline recorded above. Portable PostgreSQL/PostGIS feasibility in progress.

### 2026-09-07 — M0 complete; M1 active

- Rendered weekly PDF pages 1–2 with bundled Poppler; visually verified all headline values and pathway reconciliation. Poppler emitted missing display-font warnings, but the scanned page images rendered clearly.
- Created architecture/source notes. Matched PostgreSQL 17.11 and PostGIS 3.6.2 distributions; acquisition in progress. Actual startup/extension validation moved into M1 where the database is provisioned; no database acceptance claimed.
- Extended visual source audit delegated as an independent M1 seed prerequisite under the subagent-driven workflow. It writes only aggregate source JSON/reconciliation notes; application work remains bounded to M1.

No product requirement is marked satisfied at planning time.

### 2026-09-07 — M1 progress; resumed after usage interruption

- User requested resume with diff/file/test inspection. `git diff --stat` / `git status --short` confirm no Git repository. Current file inventory inspected; all edits preserved, no restart or reversion.
- Dependency installation completed: exact versions recorded in `package.json`/lockfile. Next 16.3.4, React 19.2.8, strict TypeScript 5.9.3. Correction to initial runtime assessment: installed Next declares Node >=20.9.0, so system 20.18.0 does meet Next's minimum. Bundled 24.19.0 is used for deterministic commands; no global installation changed.
- Unit tests ran against intentional empty stubs: 10 failed, 1 default-deny check passed. After implementation: all 11 passed, then all 11 passed again on resume. Commands: bundled `node --experimental-strip-types --test tests/unit/semantics.test.ts tests/unit/policy.test.ts`; later local `tsx --test tests/unit/*.test.ts`.
- `node node_modules/typescript/bin/tsc --noEmit`: passed for current foundation sources/tests/scripts.
- PostgreSQL17.11 initialised under `.runtime/pg-data`, loopback port55432, generated local-only credentials in ignored files; no Windows service. Database tests failed as expected before PostGIS/migration (5 failures). PostGIS installation/validation is still pending; not marked accepted.
- Added initial schema, full required indicator metadata, supplied headline seed, separate generated demo aggregates, scope-aware DAL and local demonstration session boundary. Database behaviour is not yet validated.
- Git LFS pointer detected for map download; pinned data asset fetched from GitHub media and verified as 16 features. Invalid pointer is not used by the application. Display source remains explicitly demo/unapproved.
- `npm audit --omit=dev` identified ExcelJS's transitive uuid advisory; an exact compatible uuid11.1.1 override is being validated. No force downgrade used.
- No threat bands are configured. The generic classification evaluator is tested, but map UI will use continuous numerical rate shading without assigning official or demo threat categories. This respects the user's instruction not to invent thresholds.

### 2026-09-07 — M1 complete; M2 active

- `tsx --env-file=.env.local scripts/migrate.ts`: migration ready, PostGIS3.6.2. `scripts/seed.ts`: seeded visually reconciled supplied headline aggregates and structurally separate 16-state, two-period synthetic examples.
- `tsx --env-file=.env.local --test tests/database/*.test.ts`: 5/5 passed after the recorded initial failing run. Actual spatial containment, rejection of synthetic official publication, immutable audit, immutable publication history, and organisation/geography/role isolation tested.
- `tsx --test tests/unit/*.test.ts`: 13/13 passed. Strict `tsc --noEmit`: passed. ESLint returned no errors; it reported the expected missing application-directory advisory before M2 adds routes. Prettier applied to current source/tests/scripts/config.
- Dependency audit after exact uuid11.1.1 override: 0 vulnerabilities. Installed Next runtime floor corrected to >=20.9.0; bundled Node24 used for all validation.
- Extended source audit supplements the proven headline seed; detailed demographic/state data will be incorporated only once reconciled. Source-supported M1 seed is exclusively the checked page2 values.
- Current evidence supports semantic and storage portions of ACC-001/003/005/009. Full cross-boundary application and workflow acceptance remains pending M2–M6; no full V1 acceptance claimed.

### 2026-09-07 — M2 complete; M3 active

- Added BM application shell, local demo profile switch, overview KPI snapshot, shared URL filters, five-layer state map, count symbols/rate shading, state context, search/zoom, table alternative and explanatory method panel. Unknown/no-collection/not-applicable/suppressed/zero are distinct.
- Server and map paths typecheck. `next dev --hostname 127.0.0.1` runs on port3000. Browser panel opened via Codex; Playwright/Edge captured overview/map at 1440px, 390px and 320px, all HTTP200 and no horizontal page overflow.
- First visual pass exposed SVG `<title>` hydration failure: server rendered empty titles when given multiple JSX text children. Added failing browser regression, then supplied each title as one string. Entire map browser suite: 5/5 passed, including zero/suppression, URL persistence, count view, no invented official rates and 320px reflow.
- Screenshots: `artifacts/screenshots/*overview.png`, `*map.png`; first captures include the detected development error overlay and will be replaced after the fix during M6 final QA. No claim that these initial images are final polished outputs.
- Source-audit deliverables completed: `data/supplied/weekly-2026-08-09.json`, `docs/source-reconciliation.md`; all15 report pages visually inspected. Combined W. Persekutuan is preserved; no allocation to individual territory polygons.
- PostGIS setup evidence in `docs/postgis-setup-report.md`; install helper `scripts/setup-postgis.py`. The runtime extension uses bundled GEOS3.14.1dev/PROJ8.2.1; local validation only, production dependency baseline still needs review.
- Automated approval review rejected the source helper's attempted cleanup of `tmp/pdfs`; no source or deliverable was affected. Temporary rendered PNGs remain, and no further deletion is needed.

### 2026-09-07 — M3 complete; M4 active

- Resumed by inspecting current files, missing source helper and tests; Git still absent. No existing work reverted. Completed scoped source helper/evidence, all five Teras routes/perspectives, care cohort selector with explicit loss to follow-up, partner world map, charts/tables, registry and catalogue.
- Supplied source tests now pass: initial19/19 unit checks including independent totals and selected-state-only helper. Current strict TypeScript and full ESLint pass. Map suite5/5 and Teras/registry suite6/6 pass; first runs failed on intentionally absent routes/helper, and one catalogue test selector was corrected after detecting duplicate valid links.
- Browser screenshots for seven M3 routes captured at1440/390/320px. All HTTP200 with no runtime errors. Initial small-screen matrix overflow came from absolutely positioned screen-reader unit labels escaping the scroll container; positioned container plus wrapping card badges fixed it. Regression verifies all five Teras at320px. Final screenshots will be refreshed in M6.
- No official threat thresholds, recovery definitions, current committee hierarchy, official denominators or diplomatic relationships have been invented. Teras4/5 figures remain proposed synthetic scenarios. Registry and catalogue show immutable definitions, field/lineage metadata and unresolved confidence methodology.
- M4 prerequisite: installed Windows Defender is enabled, current signatures reported, and MpCmdRun custom scan of a harmless generated `.runtime/scanner-probe.csv` returned exit0 and no threats. Use this real local scanner in the isolated worker; scanner errors will fail closed. Production scanner/platform approval remains open.

### 2026-09-07 — M4 complete; M5 active

- Resumed the interrupted contract/parser implementation, preserving existing API/storage/transition code and every completed route. Added eight versioned aggregate demo templates, CSV/XLSX parser with ZIP expansion/macros/formula/external-relationship checks, real Defender scan and an isolated child process with memory/time/output bounds and no database credentials.
- Added queue worker, encrypted quarantine, upload/validation/review UI, downloadable templates/errors, attestation, independent approval/rejection, append-only publication and revision. Publication now refreshes the latest map observation while retaining earlier versions. Migration002 applied; seed appends the two additional capacity/population demo definitions without rewriting old definitions.
- Browser workflow exposed localhost normalisation in Next request.url: valid 127.0.0.1 mutations were rejected. Origin validation now compares against the allowlisted Host header; foreign origins and viewer uploads still fail. Added unit and API regressions.
- Validation: strict TypeScript passed; full ESLint passed; unit34/34; database5/5; workflow API journey2/2 and browser template/upload journey1/1. Real scanning, file-target reuse denial, draft invisibility to executive, independent attestation/review/publication, map refresh and previous-version preservation exercised. First map assertion selected a value correctly hidden by secondary suppression; replaced the test fixture with a non-secondary value, preserving disclosure logic.
- Upload workspace inspected at1440px and320px with no page overflow. Final screenshots and full role/accessibility audits remain M6. Current worker is local demo only; OS-level worker sandboxing, production credentials/storage/scanner approval and operational deployment remain stakeholder decisions.

### 2026-09-07 — M5 complete; M6 active

- Preserved interrupted reports backend/tests and finished saved-view UI, actor-private CSV/XLSX exports, context-bound notes/decisions, revision-controlled actions and independent evidence closure. Added effective-dated demo reference/access revisions, session revocation, queue summary and immutable auditor view. Migration003 is applied.
- M5 browser/API checks: 6/6 passed including independent closure, stale revision rejection, business-role admin denial, actor-bound exports, foreign-origin rejection, access narrowing and session revocation invalidating a previously valid download. Fixed invalid slash in XLSX sheet name while retaining exact DEMO / SYNTHETIC content label; download Buffer converted to web Response-compatible bytes. Small reports are bounded to 30 DTO rows; large export generation remains unavailable, no simulated asynchronous success.
- First M6 automated accessibility run found shared low-contrast nav numbering, section labels and footer; fixed palette. Subsequent complete E2E suite32/32 passed, including13 automated accessibility/reflow routes. Unit36/36 and actual PostgreSQL/PostGIS integration5/5 passed. First production build passed; further focused hardening will receive a final build.
- Captured39 desktop/mobile/320px screenshots; all13 routes return200, zero page overflow and zero runtime errors. Inspected overview/report images; reporting labels refined to BM and shared filters added. Final production screenshots/role checks remain active.
- Applied demo suppression to small count chart cells, preserving durations/percentages as different measures. Map now reads actual definition versions and rejects comparisons when definition/boundary/coverage differ. These final changes are included in the next full check.

### 2026-09-08 — M6 local validation complete; full acceptance pending

- Preserved the current implementation and source inputs. No Git metadata exists, so no diff or commit history is available. No restart, re-scoping or destructive migration was performed.
- Fixed the four related secondary-view accessibility failures by making matrix scroll regions labelled and keyboard-focusable. Corrected the browser regression to request `outcomes` and assert the selected perspective, covering all20 secondary views at320px. Final screenshot inspection additionally found faint map safeguard text in print; applied a print-only contrast correction.
- Bundled Node commands recorded in `docs/VALIDATION.md`: formatting, ESLint (zero warnings), strict TypeScript and production build passed; unit/contracts36/36, actual PostgreSQL/PostGIS5/5, focused perspective5/5 and complete production browser suite40/40 passed. Browser suite includes workflow/revision, access revocation, actor-private exports,12 demo profiles and automated accessibility. After the final print-only correction, production build/type checking and formatting passed again; regenerated PDF/PNG visually confirm readable safeguard text. Production server and local worker are running for review.
- Final visual script:39/39 checks across13 routes at1440/390/320px; allHTTP200, no page overflow, no runtime errors. Desktop/mobile screenshots and20 secondary screenshots retained. Generated disclosed demo map PDF/print PNG; reviewed final overview, Teras, mobile map and governance presentation.
- Added validation report and manual accessibility worksheet; generated228-ID requirement inventory, retaining partial/conditional statuses. Updated README status. Application/data/policy acceptance must not be inferred from the inventory count or passing tests.
- Acceptance blocker: SPEC `ACC-006` requires actual screen-reader review; the available browser automation cannot assess native spoken output. `docs/MANUAL_ACCEPTANCE.md` specifies the review and evidence needed. Detailed KPI/data acceptance and representative performance evidence also remain open as documented; official definitions, owners, thresholds and clinical/legal scope must not be invented. M6 remains acceptance-pending, not full V1 complete.

### 2026-09-09 — Overview optimization (user-approved plan)
- O1 ACTIVE: grouped supplied snapshot, plain Malay details, constrained filters, focused live map, compact Teras links. Preserve full map and all DTO/security semantics. Backup in .runtime/overview-before-20260909; Git absent, requirements.md missing.
- O2 PENDING: format:check, lint, typecheck, test:unit, test:db, test:e2e, build, qa:visual. Inspect 1440/390/320px and disclosure/filter handoffs. Trace FR-001/002/003/009/010, ACC-020/028; full V1 acceptance limitations remain unchanged.

- O1 COMPLETE: implemented overview-only grouped supplied section, single metadata drawer, period/geography controls, URL-aware filtered empty states, focused live map, explicit Melaka suppression, compact context-preserving Teras navigation. No action query or lower evidence/governance panels on overview. Fixed rapid map layer/unit transition race found in logs; full map controls retained.
- O1 validation: new regression tests initially failed on absent source region and dash-only suppression; now 3/3 overview tests pass. All13 route accessibility tests pass, source drawer at1440/390/320px passes axe and overflow checks. TypeScript, ESLint, formatting passed; unit36/36 and PostgreSQL/PostGIS5/5 passed. Initial production build passed.
- O2 ACTIVE: final production build, full E2E, final visual screenshots and report. npm/npx shim fails on workspace ampersand; using equivalent direct local CLI commands with bundled Node24.

- O2 refinement: production suite initially42/43; found existing worker/test race (target validating while one-shot worker returns because background worker owns job). Added bounded target-specific expect.poll in workflow test; workflow3/3 pass. No worker or application behavior changed. Final full rerun active; final lint/typecheck/format pass.

- O2 COMPLETE: final complete production E2E43/43 passed (1.4m), including workflow revision, isolation, exports,13 accessibility routes and new overview tests. Formatting, ESLint zero warnings, strict TypeScript and production build passed. Unit36/36 and PostgreSQL/PostGIS5/5 passed. Visual39/39: allHTTP200, zero runtime errors/overflow. Final desktop/mobile/320px overview heights1562/2588/2599; desktop/mobile about24% shorter than restored reference.
- Outputs and exact commands: docs/OVERVIEW_OPTIMIZATION.md; artifacts/screenshots (overview plus expanded source/Melaka states and all major routes); artifacts/test-results/playwright. Production app refreshed in browser on127.0.0.1:3000; worker retained.
- Requirement trace: FR-001/002/003/009/010, ACC-020 overview portion; supports ACC-028 journey through full-map drivers/action handoff. Supplied data remains Available, map remains DEMO / SYNTHETIC. No official policy/data decisions changed. Next: user review of optimized overview; wider V1 human/screen-reader and stakeholder decisions remain as previously documented.
