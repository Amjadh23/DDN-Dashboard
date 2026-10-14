# Scenario Semasa consolidation — 7 October 2026

Milestone S1: complete. The user explicitly requested combining Gambaran nasional and Peta strategik into one page named exactly `Scenario Semasa`.

Both pages previously fetched the same geographic DTOs and rendered the same ThreatMap, with the overview hiding the fuller map controls. The combined `/` page now retains the national supplied snapshot, full five-layer geographic workspace, shared filters, search/zoom, count/rate modes, comparison, ranked-table alternative, source/driver/method disclosures, contextual actions and five Teras links. There is one sidebar entry. `/map` redirects to `/` while preserving query parameters, including selected state. Internal map links in actions, uploads and reports target the combined page. Geography changes synchronize the selected map state; action context follows the displayed state. Missing/suppressed map values retain explicit text, and the selected count/rate mode controls the detail value.

## Files changed by this milestone

- `src/app/page.tsx`: combined page content and title.
- `src/app/map/page.tsx`: legacy compatibility redirect.
- `src/app/layout.tsx`: default page metadata.
- `src/components/app-shell.tsx`: one navigation item and corrected Teras section position.
- `src/components/filters.tsx`: geography/state URL synchronization.
- `src/components/threat-map.tsx`: full controls, accurate state selection/action context, explicit unavailable states and matching count/rate detail.
- `src/components/action-workspace.tsx`, `upload-workspace.tsx`, `reports-workspace.tsx`: canonical destination links.
- `tests/e2e/overview.spec.ts`, `map.spec.ts`: consolidated-workspace, redirect, disclosure, filters, keyboard and reflow regressions.
- `SPEC.md`: user-approved section 5 route consolidation, with affected requirement IDs recorded.
- `PLANS.md`: bounded S1 milestone, decisions, validation and progress.
- `README.md`: consolidated page orientation.
- `docs/SCENARIO_SEMASA.md`: this report (created).

No source datasets, dependencies, database migrations or records were changed. Existing annual-ingestion work and unrelated working-tree changes are preserved. The map route file was replaced in place; no deliverable file was deleted.

## Commands and validation

All Node commands use `C:\Users\Muhammad Izzul Islam\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe` with the following arguments, equivalent to the package scripts. The direct CLI avoids the existing npm shim issue with the ampersand in the workspace path.

```text
node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts overview.spec.ts -g "Scenario Semasa"
node_modules/prettier/bin/prettier.cjs --write <changed TS/TSX files>
node_modules/next/dist/bin/next build --webpack
node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
node_modules/typescript/bin/tsc --noEmit
node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts
node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts overview.spec.ts map.spec.ts annual.spec.ts
node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts
```

Inspection also used `rg --files`, ordered `Get-Content` of the repository contracts and relevant Next.js installed guides, and `git status`/`git diff`. The installed guides use `.md`, not `.mdx`; the initial `.mdx` reads failed and were corrected before editing. One combined patch was rejected because it both deleted and added the same path; it applied no changes, and the corrected patch updated that file in place.

The two new consolidation tests failed before implementation on the old heading and missing redirect. After implementation, the first targeted run passed 13/16 browser tests and 7/7 isolated PostgreSQL/PostGIS tests; the three browser failures were selectors: exact label lookup included select-option text, and the mobile navigation assertion also matched the newly retained Teras card. Role/exact-name selectors corrected these tests without changing application behavior. Formatting, zero-warning lint, strict TypeScript, unit tests 39/39 and production build passed. Final complete production browser suite passed 54/54 (1.5 minutes), with isolated PostgreSQL/PostGIS 7/7, including upload/revision, roles, exports, annual data and automated accessibility. No test remains failing.

Generated images: `artifacts/screenshots/scenario-semasa-1440.png`, `scenario-semasa-390.png`, `scenario-semasa-320.png`; source-expanded states in `overview-details-melaka-*.png`; Playwright report in `artifacts/test-results/playwright`. Screenshot checks confirm reflow without horizontal overflow and automated WCAG scans of the consolidated page and expanded source disclosure. Desktop, 390px and 320px images were visually inspected.

The production demo wrapper was restarted hidden (PID 12948), using `--env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/demo.ts`, with stdout/stderr in `.runtime/scenario-server.*.log`. Only the verified previous demo wrapper and its application/worker descendants were stopped. Live weekly and annual/legacy-link HTTP smoke checks return 200 and render Scenario Semasa; the weekly snapshot and full map controls are present. No import, migration or reseeding of the demonstration was performed.

## Requirement and evidence trace

The bounded consolidation satisfies the user-approved page organisation for FR-001/FR-002/FR-003/FR-009/FR-010. Existing MAP-001, MAP-014, MAP-020, MAP-022–030 and the ACC-020/021/024/028 journeys are preserved and regression-checked; this is not a blanket completion claim for all V1 requirements.

Evidence remains supplied aggregate weekly/annual data (`Available`), source-backed annual rates (`Derived`) and structurally separate `DEMO / SYNTHETIC` map scenarios. Existing role scope, server DAL and suppression apply. No policy assignments, thresholds, populations or impact claims were invented.

Limitations/deferred items: `requirements.md` remains missing; official map boundaries, thresholds/composite methodology, production identity/governance and manual spoken screen-reader acceptance remain unresolved from the existing prototype. None is newly required to merge the existing interfaces. The exact spelling `Scenario Semasa` follows the user's instruction. Next recommended step: stakeholder review of the combined page; no additional implementation milestone is required for this request.
