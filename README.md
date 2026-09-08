# National Drug Policy Collaborative Dashboard

A governed, collaborative dashboard concept for monitoring Malaysia's five National Drug Policy pillars (**Teras**) and helping participating organisations move from fragmented data to shared analysis and accountable action.

## Current Status

The **V1 local stakeholder prototype is implemented and passes its automated validation**, with acceptance evidence and remaining limitations recorded in `docs/VALIDATION.md` and `PLANS.md`. Full contract acceptance remains open, including manual screen-reader review and the explicitly partial requirements in `docs/REQUIREMENT_STATUS.md`. It runs on Next.js 16.3.4, React 19.2.8, strict TypeScript and PostgreSQL17/PostGIS3.6.2.

The overview, five Teras, map, registry, catalogue, upload/review/publication workflow, actions, saved reports and scoped demo administration are available. Production identity and governance are deliberately unconfigured. This workspace has no Git history; all existing source documents are preserved.

## Product Goal

The platform is intended to let authorised ministries, agencies, service providers and approved partners:

- upload data through controlled templates;
- validate and approve it before official publication;
- analyse the same versioned evidence;
- compare geography, time, population, programmes and organisations;
- identify data gaps and priority areas;
- record interpretations and decisions;
- assign actions with owners and deadlines; and
- generate consistent, disclosure-safe reports.

The value chain is:

```text
shared evidence -> shared interpretation -> accountable coordinated action
```

## Five Teras

| Page | Teras | Primary question |
|---|---|---|
| 1 | Pendidikan Pencegahan | Where and among whom is risk increasing, and are prevention programmes reaching them? |
| 2 | Rawatan dan Pemulihan | Are people accessing, completing and benefiting from treatment and reintegration support? |
| 3 | Penguatkuasaan | Where is supply-related threat concentrated, and what happens through the enforcement pipeline? |
| 4 | Pengurangan Kemudaratan | What harms are occurring, and do services reach and protect affected people? |
| 5 | Kerjasama Antarabangsa | Do international relationships and exchanges lead to completed commitments and useful domestic outcomes? |

AADK is identified in the supplied 2017 policy as the main lead and coordinator. JPPP, JRP and JPU are explicitly associated with Teras 1, 2 and 3 respectively; JKMD provides national oversight and MTMD coordinates at state/district levels. Teras 4 and 5 involve distributed responsibility. Any more specific agency mapping must distinguish policy fact from functional inference and be validated against the current governance machinery.

## Malaysia Threat Map

The principal strategic visual is an interactive Malaysia map with state-level views and district drill-down where data permits.

The intended experience resembles a video-game threat map, but its statistics must remain transparent. Users should be able to switch among:

- drug burden/demand;
- supply/enforcement threat;
- harm;
- service gap; and
- data confidence.

Red, yellow, orange and green states cannot be assigned using invented thresholds. Counts and population-adjusted rates must both remain visible, and every classification must expose its formula, denominator, source, period, confidence and drivers. Insufficient, suppressed, not-applicable and zero values are different states.

## V1 Data Position

The supplied weekly AADK report provides a credible real-data slice primarily for:

- Teras 2 caseload, setting, pathway, facility and demographic/geographic context; and
- selected Teras 3 complaint and suspected-person/arrest indicators.

It does not directly measure prevention effectiveness, sustained recovery, reintegration/social acceptance, complete harm-reduction outcomes or international outcomes.

Unsupported scenarios may be demonstrated only with structurally separate and persistent `DEMO / SYNTHETIC` labelling.

## Proposed Technology Direction

- Next.js 16.x App Router
- Strict TypeScript
- React Server Components by default
- Accessible charting and MapLibre GL JS or an approved equivalent
- PostgreSQL and PostGIS
- Encrypted private object storage
- Isolated asynchronous workers for uploads, validation, aggregation, map preparation and exports
- Approved enterprise/government identity provider
- Server-enforced role and organisation/geography/data-sensitivity access

Exact versions, packages, commands and deployment topology are pending Codex repository inspection and client infrastructure decisions.

## Specification-Driven Development Structure

| File | Owner | Purpose |
|---|---|---|
| `AGENTS.md` | ChatGPT/human contract | Controls how Codex behaves. |
| `PROJECT_CONTEXT.md` | ChatGPT/human contract | Explains what the project means and why it exists. |
| `SPEC.md` | ChatGPT/human contract | Defines the V1 build and acceptance requirements. |
| `REFERENCES.md` | ChatGPT/human contract | Defines source authority, limitations and traceability. |
| `requirements.md` | Discovery input | Contains the comprehensive KPI/data/technical brainstorm and research. |
| `README.md` | Human orientation | Introduces the project and current status. |
| `PLANS.md` | Codex at runtime | Must be created after Codex inspects repository reality. |
| `TASKS.md` | Codex, optional | May be created only if granular tracking cannot remain clear in `PLANS.md`. |

## Source Documents

- `project_sources/02-Dasar-Dadah-Negara-BM_compressed.pdf` - policy basis for the five Teras, strategies, target groups, participants and evaluation framework.
- `project_sources/01-Data_STATISTIK-MINGGUAN-AADK-LAPORAN-9-OGOS-2026.pdf` - supplied operational snapshot and real V1 seed data.
- `project_sources/03-General_SDD_ChatGPT_Codex_Workflow_Guide.md` - workflow basis for ChatGPT/Codex role separation and milestone validation.

See `REFERENCES.md` before drawing claims from any source.

## Expected Repository Shape

The current SDD layer is:

```text
AGENTS.md
PROJECT_CONTEXT.md
SPEC.md
REFERENCES.md
requirements.md
README.md
project_sources/
```

After Codex inspection and planning, the repository may add:

```text
PLANS.md
TASKS.md                 # optional
src/ or app/             # determined from repository reality
tests/                   # determined from the chosen test stack
database/migrations/     # exact location determined during planning
docs/adr/                # consequential architecture decisions
```

This structure is provisional. Codex must not invent implementation paths before checking the repository.

## How Codex Must Begin

The first Codex pass should:

1. Read `AGENTS.md` first.
2. Read `PROJECT_CONTEXT.md`, `SPEC.md`, `REFERENCES.md`, `requirements.md` and this README.
3. Inspect the actual repository, dependencies, routes, data layer, tests and deployment state.
4. Report mismatches and missing prerequisites.
5. Create `PLANS.md` with bounded milestones and validation commands.
6. Stop after planning unless the user explicitly authorises implementation in the same run.

Codex should not “just build the dashboard” from a loose prompt.

## Current Limitations and Open Decisions

The following remain unresolved and must not be guessed:

- current 2026 committee hierarchy and exact data owners;
- participating V1 organisations;
- official definitions of active, new, repeat, recovered and reintegrated;
- treatment and legal-stage comparability;
- in-scope harm-reduction services;
- threat-score components, weights and red/yellow/green thresholds;
- population and geographic-boundary versions;
- small-number and export disclosure rules;
- aggregate versus pseudonymous source data;
- hosting, identity, data residency and approved infrastructure services; and
- service levels, recovery objectives and long-term operating ownership.

## Installation and Running

Existing local configuration is in ignored `.env.local`; do not replace it with the example. The application role is separate from the migration owner. See `docs/OPERATIONS.md` for the verified portable PostgreSQL setup and worker lifecycle.

```powershell
npm ci
npm run db:migrate
npm run db:seed
npm run dev
# In a separate terminal:
npm run worker
```

Open http://127.0.0.1:3000. Choose a fictional profile in the header. For a workflow demonstration: contributor uploads, steward attests, independent reviewer approves and secretariat publishes. Only generated aggregate demonstration files are accepted. Keep the isolated worker running for scanning and validation.

For the production-compiled local prototype: `npm run build`, then `npm run start`. This does not grant approval to deploy the system or ingest sensitive data.

## Validation

Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db`, `npm run test:e2e`, and `npm run build`. Browser tests require the app on port3000 and Microsoft Edge. `npm run qa:visual` captures all13 major routes at1440,390 and320 CSS pixels. The supplied source reconciliation is in `docs/source-reconciliation.md`; final results and limitations are in `docs/VALIDATION.md`.
