# V1 Dashboard Implementation Plan

## 2026-09-17 — Guided assistant demo

- ACTIVE (explicit user request): right-side local rule-based assistant, guided questions, navigation suggestions and custom generated red/blue character. Clear demo disclosure; no API keys, network chat, row data access, mutations or persistent message storage. Test rule routing/fallback, keyboard dialog behaviour, mobile layout and accessibility; then build/type/lint checks. This is a presentation-only navigation guide, not production AI or a source of policy/clinical conclusions.

## 2026-09-17 — AADK red/blue identity correction

- ACTIVE: user supplied official logo reference supersedes orange direction. Use the actual AADK website logo; blue surfaces/continuous map scale, red focal accents, cool-white evidence cards. Preserve statistics, disclosure and interactions. Verify build, lint, formatting, types, browser accessibility/reflow and map controls.

## 2026-09-17 — Orange identity refresh (user authorised)

- V1 COMPLETE: custom five-pillar SVG brand and favicon; charcoal/orange atmosphere, ivory metric surfaces, gradient focal cards, shared navigation/filter/button polish. Source labels, data meanings, permissions and map classifications preserved. requirements.md remains absent.
- V2 COMPLETE: formatting, lint, typecheck and production build passed; 39 browser route/viewport checks passed at 1440/390/320, all HTTP 200, no page errors, horizontal overflow or axe violations. Expanded KPI/source panels passed axe at all three widths; mobile navigation passed at 390/320. Keyboard skip link, visible focus, Enter disclosure and reduced-motion checks passed. Visual review corrected a compressed sidebar card and funnel fill. Screenshots and machine report: artifacts/identity. Report: docs/IDENTITY_REFRESH.md.
- Scope limits: upload end-to-end retains its existing Windows Defender/macOS limitation; no backend changes or database mutations beyond demo profile sessions. Existing full V1 human/screen-reader acceptance remains open. Next: user visual review.
- Trace: FR-001/003/009/010, VIS-002, NFR-020/021/022/023, ACC-007/010; presentation improvement only, no new data acceptance claims.

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
