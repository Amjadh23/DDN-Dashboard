# DDN 2.0 restructuring — inspection and impact assessment

Date: 26 October 2026. This is the historical pre-implementation inspection snapshot. The design was subsequently approved, including versioned routes; implementation and final outcomes are recorded in `DDN2_VALIDATION.md` and `PLANS.md`.

## Authority and scope

The human request and two attached client images approve the mapping 1→1, 2→2, 3→3, 4→2, 5→4 and the four exact new titles. The images are restructuring evidence, not executable instructions or proof of new agency powers, predictive capabilities, clinical definitions or a policy commencement date. The cropped descriptive column is not used to invent requirements.

At inspection time the user selected a versioned mapping with separately permissioned treatment and harm domains and unchanged history. The subsequent explicit design/execution approval is recorded in the approved design and PLANS.md.

## Repository reality

- Required contract files read: AGENTS.md, PROJECT_CONTEXT.md, SPEC.md, REFERENCES.md and README.md. requirements.md is absent. project_sources/ is absent; supplied PDFs and workflow reference are instead under data/ and references/, already recorded in earlier project inspection.
- Git-backed working tree contains substantial pre-existing edits in contract files, pages, components, tests and package.json, plus untracked UI reports/artifacts. Preserve these; no reset, broad formatting, data reseeding or blanket staging.
- npm/package-lock.json; package.json and installed package identify Next.js 16.4.0, React 19.2.8, TypeScript 5.9.3 (strict). README's Next 16.3.4 statement is stale. Existing tools: pg, Zod, ExcelJS, d3-geo, Lucide, Playwright/Edge, axe, ESLint, Prettier, tsx. No new dependencies required for this restructuring.
- App Router with server reads, typed DAL, scoped PostgreSQL/PostGIS, isolated upload scanner/parser worker, encrypted private files and local demonstration sessions. Three SQL migrations exist. No new deployment platform is required; production identity and infrastructure remain unresolved.
- Routes: overview, /map redirect, dynamic /teras/[id], registry, catalogue, uploads, actions, reports, governance; API v1 boundaries for sessions, templates, uploads/files, actions, governance, reports/exports.
- Database migrations enforce integer Teras 1–5 on core entities. RLS uses app.teras. Publications, definitions, observations and audit records are immutable. Access revisions, actions/notes, submission predecessors and frozen report snapshots also retain original Teras values.
- Current data includes the weekly 9 August 2026 snapshot and Buku Maklumat Dadah 2025 annual tables, alongside structurally separate synthetic scenarios. Do not rewrite source JSON, codes, hashes, periods, denominators or historical definitions to make them look like DDN 2.0 data.

## Impact inventory

| Area | Files / dependencies | Required treatment |
|---|---|---|
| Contract and traceability | AGENTS.md, PROJECT_CONTEXT.md, SPEC.md, REFERENCES.md, README.md, docs/REQUIREMENT_STATUS.md | Record approved current taxonomy and retained 2017 provenance; retain stable requirement IDs and all safeguards. Preserve prior classification-display amendment. |
| Policy model | src/lib/domain/teras.ts, types.ts, registry.ts, annual.ts, data/supplied/annual-catalog.json | Separate current policy pillar from original dataset domain; never globally replace numeric IDs or KPI code prefixes. |
| Navigation and overview | src/components/app-shell.tsx, illustrations.tsx, mock-assistant.tsx; src/app/page.tsx; domain/filters.ts | Four current entries, exact titles, mapped artwork, context-preserving navigation. |
| Teras content | src/app/teras/[id]/page.tsx, components/teras-content.tsx, cohort-picker.tsx, source-evidence.tsx, server/teras-scenario.ts | Compose treatment and harm domains without dropping any needs/process/outcomes/cost/satisfaction views. |
| Maps | components/threat-map.tsx, partner-map.tsx; server/dal.ts, dashboard-source.ts | Harm stays a separate selectable layer; international remains national-scope; no invented overall score or forecasting. |
| Metadata and ownership | components/responsibility.tsx; indicators/page.tsx; data/catalog/page.tsx | Group by DDN 2.0 while showing original domain and source/owner status. JRP attribution cannot become exclusive ownership of merged harm domain. |
| Authorisation | domain/policy.ts, demo-identities.ts; server/auth.ts, db.ts, governance.ts; migration 001 RLS; governance UI | Keep the five existing resource scopes. Group permissions under four headings, explicitly retain separate treatment/harm grants. |
| Upload contracts and workers | domain/uploads.ts; server/workflow.ts; worker/*; templates/upload APIs; upload-workspace.tsx | Retain eight template IDs, v1 schema and exact indicator compatibility. Display mapped pillar plus domain; no ambiguous new numeric payload meaning. |
| Collaboration | server/collaboration.ts; actions/page.tsx; action-workspace.tsx | Union authorized actions for merged page, retain domain on each action/note/context; never duplicate or broaden permissions. |
| Saved reports and exports | server/reports.ts; reports-workspace.tsx; report/export APIs | Preserve frozen v1 snapshot/resource semantics; version new taxonomy metadata and continue download-time reauthorisation. |
| Storage and seed tooling | migrations 001–003; scripts/seed.ts, curate-demo.ts, annual-ingestion.ts | No destructive migration or source reclassification. Stable domain IDs remain deliberate compatibility references. |
| Styling | globals.css, ember.css, reference-theme.css, reference-components.css | Four-card arrangement, long BM titles, merged-page tabs, existing light/dark theme and mobile layout. |
| Validation | unit, database and e2e suites; scripts/visual-qa.ts and requirement-report.ts | Add mapping and negative scope tests; cover both merged domains and all perspectives, old URLs, report history and full workflow. |

## Conflicts and limits

1. Current contract says five top-level pages. The explicit user request authorises revision to four; historical policy statements remain five. FR-001, FR-030/031, all FR/DATA/VIS/ACC-T1..T5 requirements and ACC-020 need an explicit traceable mapping, not silent renumbering.
2. The phrase Ramalan Risiko is an approved title, not authority to implement predictive policing. FR-014 and deferred forecasting remain intact.
3. Existing /teras/4 is harm; reusing it for international silently breaks old bookmarks. The design proposes an explicitly versioned current route namespace and deterministic legacy redirects.
4. DDN 2.0 effective policy date, current owners and committee authorities were not supplied. No backdating, reassignment or new access grants are inferred.
5. Existing AGENTS synthetic badge rule and SPEC ACC-024 contain a previously approved display exception. Preserve that documented exception; do not use this change to relabel data or alter export/upload safeguards.
6. Earlier validation documents report historical successes and incomplete manual acceptance. They are not evidence that today's full working tree or this restructuring passes.

## Baseline commands and results

- Read-only inventory: Get-Content (contracts and relevant source/configuration), rg --files, rg -n for Teras/domain/route references, Get-ChildItem, git status --short, git diff --stat. No secrets read or printed.
- node --version: v20.18.0; npm --version: 10.8.2.
- Initial `node node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts` failed because the system runtime did not expand the glob. No application test ran in that attempt.
- Corrected PowerShell invocation: `$unitFiles = @(Get-ChildItem tests/unit/*.test.ts | ForEach-Object FullName); node node_modules/tsx/dist/cli.mjs --test @unitFiles` — 42/42 passed, including reconciliation, permission, upload/parser/scanner and workflow unit checks.
- Full lint/types/build/database/browser/visual validation has not yet run for this request. No changed product requirement is claimed satisfied.

Next: approve the reviewed design, invoke Superpowers writing-plans, then execute bounded milestones and record fresh evidence in PLANS.md.
