# DDN 2.0 restructuring — implementation and validation

Date: 26 October 2026. Scope: approved four-pillar restructuring of the local stakeholder prototype. This does not close the pre-existing production/governance or manual accessibility acceptance items.

**Outcome: D1–D4 complete for the approved restructuring.** Final checks passed: 46 unit tests, 7 database checks, 80 browser tests, 54 visual checks, formatting, zero-warning lint, strict types, production build and normal repository-configured `git diff --check`. Four Important review findings were fixed; no Critical finding or deferred reviewer minor remains. The final build is available locally at http://127.0.0.1:3200. Changes remain reviewable and uncommitted in the existing feature branch; no merge or push was performed.

## Architecture and retained meaning

The four current pages use `/ddn-2/teras/1..4`. Original domain IDs remain 1–5 in database rows, access grants, API v1 payloads, templates, KPI codes and frozen report resources. The mapping is versioned as `ddn2-client-2026-10-26`; it is not a legal effective date.

Current Teras 2 contains both treatment and harm subviews, each with needs, process, outcomes, cost and satisfaction perspectives and its own permission checks. Existing clinical caveats, cohorts/loss to follow-up, source settings, service cascades, maps, matrices and actions remain. Counts across incompatible domains are not added. Current Teras 4 retains the international partner/commitment experience.

Legacy `/teras/4` redirects to current Teras 2's harm view; `/teras/5` redirects to current Teras 4. Valid filters, perspectives, source settings and cohorts survive the redirect. Historical registry `teras` queries keep domain semantics; current `pillar` queries group both authorized treatment/harm domains under pillar 2.

New report snapshots record mapping metadata; old snapshots without it remain readable and export as historical domain views. Export/download checks retain the original access resources. No migration, reseed of the demonstration database, source reclassification or grant expansion was performed.

## Verification record

Execution uses the bundled Node 24.22.1 runtime. Windows npm shim and wildcard issues are avoided with direct local CLIs and explicit unit file expansion. Logs are under ignored `tmp/ddn2-*.log`; browser reports/traces/screenshots are under `artifacts/`.

| Check | Evidence / outcome |
|---|---|
| Mapping tests | Initially failed on absent feature; all domain mappings, legacy route meaning and permitted merged selection passed after implementation. |
| Unit/contracts/source reconciliation | Final functional run: 46/46 passed, including permission semantics, suppression, reconciliation, uploads/parser/scanner and merged-navigation regression. |
| Formatting | Full Prettier check passed. |
| Lint | Full ESLint check passed with zero warnings after removing an unused icon import. |
| Strict types | `tsc --noEmit` passed; production build also checks types. |
| Production build | Standard build reported existing Next.js security advisory; normal immediate retry completed successfully. Separate dependency report: NEXTJS_SECURITY_ADVISORY.md. |
| Database/PostGIS | Final full runner's seven checks passed: reconciliation/idempotency, spatial joins, synthetic-origin constraint, immutable history and row-security isolation. |
| Browser | **80/80 passed** in the final sequential full run (3.2 minutes), including historical snapshots, role checks, source/permission isolation, all evaluation perspectives and both domain upload/revision journeys. This run includes the final DDN 2.0 topbar/overview wording. |
| Light visual inspection | 39 route/viewport checks: HTTP 200, no page overflow and no runtime errors, at 1440, 390 and 320 pixels. |
| Dark visual inspection | 15 current-Teras/domain/viewport checks: HTTP 200, dark theme applied, no overflow and no runtime errors. |
| Independent review | No Critical findings; four Important findings fixed and regression-tested. See below. |

The isolated runner creates its own `dashboard_e2e_*` database and localhost:3100 server, and removes only its validated test database/storage. It does not run business-data migrations or upload fixtures into the demonstration database. Visual checks use a separate localhost:3200 production server and existing demonstration data. Final build logs are `tmp/ddn2-release-build*.log`; full browser/database results are `tmp/ddn2-release-e2e.log`; formatting/lint/types/unit logs use the same `ddn2-release-*` prefix. The security reminder was resolved for local verification through the normal immediate retry, with the advisory retained separately.

## Regressions found and corrected

- Old five-page/count/title assertions were updated to four current pages; perspective selectors now target their labelled navigation rather than matching both domain and perspective links.
- Native select intrinsic width from long domain names caused a 332px page at 320px. The action form now constrains select/label width; full reflow/axe and visual checks cover it.
- A new historical snapshot fixture initially attempted an update and correctly hit immutable storage. The fixture now inserts a separate old-format record in the isolated database. No immutability constraint was weakened.
- That fixture also initially used a prefixed ID; the export endpoint correctly rejected it under the existing UUID rule. It now uses a valid UUID. An intermediate full run reached 78/80; its other failure was Chromium `ERR_NO_BUFFER_SPACE` during concurrent visual work. The final run executes browser and visual suites sequentially, without adding retries or weakening assertions.
- Prevention and other pages lost authorized contextual map layers when the selected-domain session was passed to the map DAL. Scenario/source reads stay domain-scoped; map layers use the original session and existing resource-level checks. The new prevention burden-map regression failed before this fix.
- State-scoped users opening a default national route were denied before geography controls appeared. Page availability now considers permitted geographies, while actual values still enforce requested geography. A dedicated failing-then-passing regression exercises this.
- Applying action filters dropped the mapping version and silently removed harm-domain actions from the merged list. The form now retains the validated mapping parameter. Historical unversioned URLs retain single-domain behavior.
- Sidebar links to merged pillar 2 forced a burden layer for harm-only users. Current navigation leaves that default to the selected permitted domain. Unit and browser regressions cover harm-only navigation and denial of treatment values.

## Requirements trace

| Stable requirements | Current implementation / evidence |
|---|---|
| FR-001, FR-030/031, ACC-020 | Four canonical pages, both pillar-2 domains, all five evaluation perspectives; canonical/legacy routing and Teras browser suites. Broader original per-KPI acceptance remains bounded by existing data. |
| FR-T1-*, DATA/VIS/ACC-T1-* | Current pillar 1, preserving prevention source/context and burden-map access where authorized. |
| FR-T2-*, DATA/VIS/ACC-T2-* | Current pillar 2 treatment subview, preserving cohorts, follow-up, settings and definitions. |
| FR-T3-*, DATA/VIS/ACC-T3-* | Current pillar 3, preserving legal-stage distinctions; new title does not enable predictive policing. |
| FR-T4-*, DATA/VIS/ACC-T4-* | Current pillar 2 harm subview; identifiers continue to mean original harm domain 4. |
| FR-T5-*, DATA/VIS/ACC-T5-* | Current pillar 4 international view; identifiers continue to mean original domain 5. |
| SEC-001..005, ACC-005/027 | Original role/organisation/geography/domain/sensitivity/workflow checks; negative treatment/harm/international/state-scope tests, self-approval and revoked-export checks. |
| FR-004, WF-001..008, ACC-004/026 | Both domains 2 and 4 complete upload, scan/validate, attest, independently approve, publish, view and revise in the actual isolated worker/database journey. |
| FR-005, DATA-010/011 | Current registry grouping and historical single-domain queries; stable codes/definition versions. |
| FR-008, FR-051/052/055 | New report mapping metadata, original frozen resources, historical snapshot export and download-time reauthorization. |
| DATA-005/025, ACC-008/023/024 | Existing weekly/annual source reconciliation and immutable provenance remain; synthetic data stays structurally separate and exports/upload contracts retain classification. Prior ACC-024 display exception is preserved. |
| MAP-001/014/028..032, NFR-020..024, ACC-006/007/010/029 | Separate layers, map/table and keyboard checks, automated axe, both themes and 320px reflow; no new thresholds or composite. Manual screen-reader acceptance remains open. |

This crosswalk relocates stable obligations; it does not assert that every previously partial KPI or production requirement became complete. `docs/REQUIREMENT_STATUS.md` continues to record 228 stable requirement IDs and their earlier bounded status.

## Files and outputs

Created: `src/lib/domain/pillars.ts`, `src/app/ddn-2/teras/[id]/page.tsx`, `tests/unit/pillars.test.ts`, `tests/e2e/ddn2.spec.ts`, the impact assessment, approved design/plan, this report, ADR 0002, separate dependency report, and local copies of the two supplied client images under `references/client-ddn2-*.png`.

Changed: AGENTS.md, PROJECT_CONTEXT.md, SPEC.md, REFERENCES.md, README.md, PLANS.md; old Teras route redirect; overview, registry, catalogue, actions/governance pages; navigation, illustrations, assistant, responsibility, filters, map handoffs, upload/admin/action/report presentation; reports metadata; responsive form/four-card CSS; relevant unit/browser expectations; visual-QA and requirement-report scripts; generated requirement-status documentation.

Application/API data semantics remain in the existing DAL, worker, database schema and upload contracts. `git diff --name-only` confirms no change to database migrations, supplied source JSON, domain policy grants, registry definitions, demonstration identities, workflow backend, database scoping or package-lock.json during this restructuring. The intake already contained user changes to package.json and several UI/source/test files; those were preserved and are not all attributed to this run. No files were deleted.

Outputs include `artifacts/screenshots/{desktop,mobile,reflow}-ddn-2-teras-*.png`, corresponding `dark-*` images, `inspection.json`, `ddn2-dark-inspection.json` and the latest Playwright report. Existing source PDFs and their reconciled hashes are preserved.

## Exact command families

```powershell
node node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
node node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
node node_modules/typescript/bin/tsc --noEmit
$unitFiles = @(Get-ChildItem tests/unit/*.test.ts | ForEach-Object FullName)
node node_modules/tsx/dist/cli.mjs --test @unitFiles
# The following node commands use the bundled Node 24 executable:
node node_modules/next/dist/bin/next build --webpack
node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/e2e.ts
$env:QA_BASE_URL='http://127.0.0.1:3200'
node node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts
node tmp/ddn2-dark-qa.mjs
node node_modules/tsx/dist/cli.mjs scripts/requirement-report.ts
git diff --check
```

## Remaining limitations and next step

`requirements.md` remains absent. Current DDN 2.0 legal commencement, committee authority, new KPI definitions, production identity/hosting/security and broader clinical/governance decisions remain for stakeholders. No new authority or forecasting was inferred. Full manual screen-reader assessment, representative field performance and existing production acceptance remain open.

The Next.js advisory and adjacent Zod audit finding are tracked separately; dependencies were not upgraded as part of this work. Next recommended step after client review is the separately scoped dependency remediation and previously documented stakeholder/manual acceptance work, rather than a data renumbering migration.
