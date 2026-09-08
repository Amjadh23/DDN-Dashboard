# Overview optimization — 9 September 2026

## Delivered change

User-approved progressive overview: supplied national snapshot, focused interactive demo map, compact navigation to five Teras. The four figures are read from the existing authorised DAL: 47,084 total clients; 5,260 institutional and 41,824 community clients; 5,208 cumulative complaints separately. No source values, formulas, definitions, database schema, permissions or disclosure rules changed.

The snapshot now has one plain-Malay source drawer. Source metadata is preserved in DTOs and the registry; internal publication IDs do not appear in this drawer. Only period and geography filters render. Inherited advanced URL filters are retained and disclosed with a reset link. Unavailable period/geography/source combinations show an explicit empty state rather than repeating national totals.

The overview map retains live SVG selection, layer switching, count/rate, accessible table, period, denominator and completeness. Search, zoom, methodology and action/driver workspace remain on /map. A prominent full-map link carries filters and the selected state. Melaka's suppressed headline says Disekat and explains small-cell protection. Zero and unknown have separate states. Rapid layer/unit changes wait for the transition rather than overwriting a newly chosen layer.

Overview action/evidence/governance panels and their action query were removed. Five compact Teras links preserve filters. Desktop and mobile spacing, map legends, labels and touch targets were refined using screenshots.

## Changed files

- src/app/page.tsx
- src/components/filters.tsx
- src/components/threat-map.tsx
- src/app/globals.css
- tests/e2e/overview.spec.ts (new)
- tests/e2e/workflow.spec.ts (bounded wait for the target background job)
- PLANS.md
- docs/OVERVIEW_OPTIMIZATION.md (this report)

Generated outputs: artifacts/screenshots (39 major-route captures plus three expanded-drawer/Melaka captures), artifacts/test-results/playwright, artifacts/test-results/e2e. Before-edit copies of the affected existing source/test/plan files are in .runtime/overview-before-20260909. No Git metadata exists; this is not a Git commit or rollback.

## Validation commands

Final results: formatting PASS; ESLint PASS (zero warnings); strict TypeScript PASS; unit/contracts 36/36 PASS; PostgreSQL/PostGIS 5/5 PASS; complete production E2E 43/43 PASS; production build PASS; visual route checks 39/39 PASS. The browser suite includes all 13 automated accessibility routes plus open source-drawer checks at three sizes. O1 implementation and O2 validation are complete. Wider V1 human acceptance remains open as described below.

Executed from the repository root. The npm/npx shim fails with the ampersand in the workspace path, so equivalent local CLI entrypoints were used. Build and tsx commands use the bundled Node24 executable:
C:/Users/Muhammad Izzul Islam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe

- node node_modules/prettier/bin/prettier.cjs --write [changed source/test files]
- node node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
- node node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
- node node_modules/typescript/bin/tsc --noEmit
- [Node24] node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts
- [Node24] node_modules/tsx/dist/cli.mjs --env-file=.env.local --test tests/database/*.test.ts
- node node_modules/@playwright/test/cli.js test tests/e2e/overview.spec.ts
- node node_modules/@playwright/test/cli.js test tests/e2e/overview.spec.ts tests/e2e/map.spec.ts
- node node_modules/@playwright/test/cli.js test tests/e2e/overview.spec.ts tests/e2e/accessibility.spec.ts
- [Node24] node_modules/next/dist/bin/next build --webpack
- [Node24] node_modules/next/dist/bin/next start --hostname 127.0.0.1
- node node_modules/@playwright/test/cli.js test
- [Node24] node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts --foundation
- [Node24] node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts

Initial new tests failed on the absent grouped source region and unexplained suppression as expected. A later exact-label selector timed out despite the native combobox being accessible; the test now locates its role and accessible name. Inspection of request logs exposed the separate rapid layer/unit race, which was fixed and tested. No failing check was waived.

## Requirement trace

| Requirement | Evidence for this change |
| --- | --- |
| FR-001, ACC-020 (overview portion) | Ordered executive snapshot, live map and all five Teras links |
| FR-002 | State map, layer and count/rate controls, table and full-workspace handoff |
| FR-003 | Period/geography and layer/state URL behavior, reload and navigation regression tests |
| FR-009 | BM-first labels and plain-language source drawer |
| FR-010 | Explicit supplied versus DEMO / SYNTHETIC sections and retained map labels |
| ACC-028 (supported journey, human acceptance open) | Read national scale, choose state, inspect value/status/completeness, open full map for drivers and accountable action |

## Data and limitations

Supplied snapshot: Available evidence, existing report reconciliation. Map: generated DEMO / SYNTHETIC observations and denominators, unapproved demonstration boundaries. No invented threat bands, owners, targets or policy facts. Human approval is still required for official definitions, thresholds, current ownership and production governance.

requirements.md remains absent, as documented before this run. Contract and source documents were preserved. The existing wider V1 limitations in docs/VALIDATION.md and docs/MANUAL_ACCEPTANCE.md remain, including actual screen-reader review and stakeholder usability acceptance. Automated checks do not certify that a nontechnical stakeholder understands the page. The next step after this page milestone is human review of the running overview.

### Validation refinement
- The first complete production browser run passed42/43. The upload test raced with the continuously running worker: its one-shot worker returned while the target submission was still validating.
- tests/e2e/workflow.spec.ts now polls the specific submission with a bounded timeout, retaining the required validated state. Workflow tests3/3 then passed. This is a test synchronization correction; worker and workflow application code are unchanged.
- Production visual QA passed39/39 (13routes at1440/390/320), HTTP200, zero overflow and zero runtime errors. Final overview screenshots are1440x1562,390x2588 and320x2599. Compared with the restored1440x2053 and390x3384 captures reviewed during planning, desktop/mobile page length is reduced by about24%.
- In-app browser refreshed to the production overview; browser error log empty. Reviewed desktop, mobile and320px screenshots, including expanded source details and Melaka suppression.
