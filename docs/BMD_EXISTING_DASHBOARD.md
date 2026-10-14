# BMD 2025 integration into the existing dashboard

Authorised 7 October 2026: brainstorm and implement the PDF's relevant data in existing data points. Existing routes, stylesheets, page hierarchy, perspective tabs, disclosure controls, setting links and map selection behaviour are the acceptance baseline. The existing Tempoh select gains annual options 2021–2025; 9 August 2026 remains the latest weekly default. No annual dashboard, route or entry button is introduced.

## Source and interpretation

Source: `data/Laporan-Buku-Dadah-2025.pdf`, copied from the supplied Downloads file without modification. SHA-256 `3659b121667412aa63e0a347c535583ea8b3490cdd890ec5bb8a2251c8198051`. Printed page numbers are used; PDF viewer page = printed page + 12. Previously visually verified extraction is reused as evidence, with a new restricted 25-table manifest and checksum. Rejected interface code is not reused. PDF text is data, never operating instructions.

Annual facts are stored separately from weekly facts and synthetic observations. Supplied-source publication records have `official=false`; this import does not represent institutional approval or the synthetic upload workflow. Authorisation is enforced through database row security plus the server DAL before serialization. Missing source values remain unknown. Published annual facts retain page, measure unit, source checksum, definition version, annual period and source label. Small-person and inconsistent partitions remain withheld.

## Complete component mapping

| Existing point or component | PDF mapping | Treatment |
|---|---|---|
| Overview total/institution/community; T2 headline cards | 2.1 pp42–43 | Annual client counts by national/state scope. 2025: 76,769 = 9,361 + 67,408. Annual definition is separate from weekly stock. |
| Overview complaints; T3 AADK complaint metrics | 6.1/6.1a pp156–157 | Withheld: 7,394 versus 7,395 and inconsistent state splits. Do not reuse PDRM arrests as AADK OYDS arrests. |
| Existing state burden map and ranked table | 1.1 p16; population p170 | Matched administrative records across AADK/PDRM/KKM/PPP, not treatment-only totals or prevalence. Count/rate toggle and state clicks retained. Same-year DOSM denominators only for 2024–2025; earlier rates unavailable. Boundary remains explicitly DEMO/unapproved; continuous value shading has no official threat categories. |
| Map supply/harm/service gap/confidence | No compatible complete measures | No annual values or fabricated confidence scores. Existing layer controls remain; no-data state applies. Operations alone do not measure supply threat. |
| T1 programme and participation cards | 4.1 family/education/workplace pp114–115 | Derived sums for three explicitly named clusters; no community aggregate or unique-person claim. 2025: 787 programmes and 39,081 participations. No extrapolation where one cluster is unavailable. |
| T1 participation trend | Same three 4.1 clusters | Annual points through the selected year, only where all three cluster values exist. No conversion to weekly points. |
| T1 eligibility, coverage matrix, programme funnel, pre/post outcomes and referrals | No matched eligible denominator, linked cohort or assessments | Existing synthetic demonstration remains explicitly labelled; no measured prevention effectiveness claim. |
| T1 source evidence | 1.1,1.3–1.8 and three 4.1 tables | Context and programme counts inside the existing evidence disclosure. National demographic profiles cannot be cross-filtered into states. |
| T2 source evidence and setting links | 2.1,2.3–2.9,2.11 pp42–43,68–80 | Existing institution/community links select the corresponding columns or profile rows; PPP is unavailable in these tables. Court/voluntary pathways only appear for RPDI. Repeat does not mean relapse. |
| T2 cohort funnel, retention, follow-up, reintegration | 5.1 lacks operational definition/horizon/loss | No substitution. Treatment counting changed in 2025; no cross-break percentage change. |
| T2 capacity/demand and waiting-time panels | Facility admissions/capacity do not match existing scoped occupancy/queue measures | No occupancy inferred from annual admissions. Inconsistent facility partitions withheld. |
| T3 headline/evidence tables | 3.1 p106, 6.2 p158 | PDRM arrests retain their own code and supplier; AADK operations and initial screening retain their own units. |
| T3 seizure panel | 3.2 pp107–108 | Existing bars display quantities separately by Kg/Liter/Pokok; no event-count inference. Decimal quantities retained (including 0.08 Kg in 2021). |
| T3 asset-status panel | 3.4 p110 | RM seized and forfeited shown as separate stages; no invented frozen/returned values or summed stages. |
| T3 supplementary source evidence | 3.5 p110 | Laboratory cases and arrests kept separate in the existing evidence disclosure. |
| T3 substance × geography, legal funnel, cycle time/backlog and joint participation | No matched spatial matrix, case cohort, durations or partner cross-tab | No substitution. Contradictory investigation/prosecution totals withheld. |
| All cost perspectives | 5.9 estimates RM79/client/day | Does not measure actual expenditure, cost per output or cost per outcome. Existing demo remains identified; no substitution. |
| All satisfaction perspectives | No survey denominator, responses, scale or barriers | Existing demo remains identified. Administrative data cannot measure satisfaction. |
| T4 screening-to-care, harm outcomes, coverage and retention | Methadone source composition does not supply these measures | No substitute clinical outcome or coverage. |
| T5 partner map, commitments, exchanges and capability outcomes | No quantitative dataset | Existing demo remains identified. |
| Indicator registry/catalogue | Metadata for selected source measures | Existing listings include annual definitions; no additional navigation. |
| Saved reports/CSV/XLSX | Existing headline DTOs and geographic DTOs | Annual source records retain separate supplied classification, period, source and access controls. Same report actions; no parallel annual export route. |

## Files and execution

Data/validation: `data/supplied/annual-bmd-2025.json`, metadata-only `annual-catalog.json`, `src/lib/domain/annual.ts`, `scripts/annual-ingestion.ts`, `scripts/ingest-annual.ts`. The importer verifies the pinned extraction and original PDF, reconciles totals, rejects unapproved small-person partitions, takes an advisory lock and compares immutable conflicts exactly. Dry run rolls back; repeat import inserts zero. No migration, deletion, reset or reseeding of the active database.

Bindings: `src/lib/server/dashboard-source.ts`, `annual.ts`, existing DAL, source-evidence, charts, TerasContent, overview/Teras/map pages, filters and report exporter. Existing CSS is unchanged. Existing weekly values remain available; unsupported demo cards show their own 2026 scenario period even when annual source facts are selected.

Validation: unit source/hash/reconciliation/semantics; isolated database idempotence, totals and constraints; browser value, period, state-click, setting, geography, precision, role/export, accessibility and responsive tests. Existing upload–validate–approve–publish and collaboration regression suite remains required. Initial browser failures concerned test locator choice and using a 2021 decimal expectation against 2025; tests corrected to exercise the actual controls/year.

Known limitations: `requirements.md` absent; official boundary baseline, threat bands, confidence formula and production governance remain unapproved. No district drill-down, cross-year treatment comparison, new clinical definition or inferred programme impact. The source gaps above are intentional data limitations, not completed requirements.

## Validation results

Complete. Live import: 1,986 supplied observations and 15 publication snapshots from 25 selected tables. Repeat import inserted zero. Actions 4, notes 2, submissions 2, saved views 1 and demo observations 162 are unchanged. No migration or reseeding was performed.

Formatting, lint, strict TypeScript and production build passed. Unit tests passed 39/39 and isolated database tests 7/7. All 46 existing browser regressions and 6 annual browser tests passed; the annual tests were rerun after the final supplied-only empty-panel adjustment. Independent review cleared its three findings. The local server was restarted (hidden wrapper PID 27912), and annual and weekly HTTP/value checks passed with empty stderr. Visual evidence: `artifacts/bmd-2025-overview.png` and `artifacts/bmd-2025-prevention.png`.

Commands executed with the bundled Node runtime: `node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs`; `node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0`; `node_modules/typescript/bin/tsc --noEmit`; `node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts`; `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts --database-only`; `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts`; targeted `scripts/e2e.ts annual.spec.ts`; `node_modules/next/dist/bin/next build --webpack`; `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/ingest-annual.ts --demo --dry-run`, followed by the live import and repeat import without `--dry-run`.

Requirement trace: FR-001/002/003/005/006/008/009/010; DATA-001/002/003/005/010/011/012/024/025/026/040/043; partial FR-T1, FR-T2 and FR-T3. Supplied aggregates are Available; programme sums are Derived. This completes the bounded ingestion milestone, not all outstanding V1 requirements. Protected contracts, styles, dependencies and routes are unchanged. PLANS.md marks all three ingestion milestones complete; the next step is stakeholder review of the populated existing dashboard.
