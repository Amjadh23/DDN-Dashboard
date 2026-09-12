# Stakeholder demonstration refinement — 10 September 2026

## Verdict and scope

**LAUNCH-READY FOR CONTROLLED STAKEHOLDER DEMONSTRATION.** This is a design/QA judgment for the local, facilitated, synthetic prototype—not full V1 acceptance, production approval, or evidence that representative users have met the brief's “within seconds” criterion. Formal spoken screen-reader review and stakeholder task-based acceptance remain pending under `docs/MANUAL_ACCEPTANCE.md`.

The authorised refinement brief superseded the earlier read-only QA instruction. Work continued from the completed QA baseline; the product was not rebuilt or re-scoped. R1–R3 are complete. No source contract, official data, policy threshold or database schema was changed. No commit or deployment was performed.

## What changed

- **Demo hygiene:** a separate curated database replaces the polluted instance for normal startup. Four actions (one independently closed), two notes/decisions, two scanned submissions (one published; one awaiting attestation) and one saved report provide realistic journeys. Original database/history/private files remain recoverable and unchanged.
- **Registry:** 26 large expanded definitions became eight compact disclosure rows per page. Search, Teras filtering, full metadata and direct definition links—including targets on later pages—remain available.
- **Five Teras:** the policy question, responsibility, filters and five existing perspectives lead each page. Detailed needs, supplied tables and quality metadata are disclosed on request. Secondary perspectives no longer repeat the hero map and supplied KPI deck. Teras 1/3/4 use the existing compact map representation with a route to the full map. Only relevant incomplete actions are previewed.
- **Current work:** Actions show status counts, owner, due date and incomplete records before creation/history. Four records per page; editing, context and notes open on request. Uploads show current submissions, validation state and the next required actor; history, technical metadata and new submission forms no longer dominate the default view.
- **Governance/catalogue/reports:** condensed ownership, reference and audit details; short saved-report/export lists; essential controls remain accessible to their authorised roles.
- **Language and hierarchy:** readable BM status/evidence/owner/geography labels replace internal keys in ordinary browsing. Repeated descriptions, inactive filter controls and oversized empty action panels were condensed. Body text was not shrunk to obtain shorter pages.
- **Responsibility gap:** one shared disclosure adds JKMD national oversight and MTMD state/district coordination alongside AADK, JPPP/JRP/JPU and shared Teras 4/5 responsibility. Historical policy basis and current-structure validation remain explicit.
- **Map explanation:** concise statements explain numerical analytical shading, unapproved composite classification and unavailable/unvalidated district data. No thresholds, district figures or official red/amber/green status were invented.

## Measured default-page reduction

Measurements are full document heights in pixels, not task-completion times. Desktop viewport: 1440×1050; mobile: 390×844; narrow reflow: 320×800. Same route/profile defaults as the prior captures. Improvements combine deliberate content curation and presentation changes. Expanded evidence/history will intentionally require more scrolling.

| Route | Previous desktop | Refined desktop | Reduction | Refined mobile | Refined 320px |
|---|---:|---:|---:|---:|---:|
| Overview | 1562 | 1562 | unchanged | 2588 | 2611 |
| Threat Map | 1229 | 1229 | unchanged | 1853 | 1851 |
| Teras 1 | 4453 | 1707 | 62% | 2213 | 2317 |
| Teras 2 | 3125 | 1843 | 41% | 2563 | 2675 |
| Teras 3 | 3126 | 1948 | 38% | 2677 | 2767 |
| Teras 4 | 2348 | 1615 | 31% | 2130 | 2221 |
| Teras 5 | 2571 | 1513 | 41% | 1897 | 1980 |
| Uploads | 3843 | 1187 | 69% | 1285 | 1385 |
| Catalogue | 1263 | 1050 | 17% | 1360 | 1476 |
| Registry | 6066 | 1311 | 78% | 1376 | 1388 |
| Actions | 3930 | 1057 | 73% | 1411 | 1405 |
| Reports | 1551 | 1050 | 32% | 1284 | 1504 |
| Governance | 3342 | 1050 | 69% | 889 | 933 |

Mobile Registry reduced from 6835 to 1376px (80%), Actions from 5478 to 1411px (74%), and Uploads from 4487 to 1285px (71%). Some short desktop routes reach the viewport minimum; their 1050px height is not all content.

## Human-centered review

All 13 major routes were visually inspected at desktop and 390px. Additional 320px inspection covered map, Registry, Actions, Uploads and Teras 2; all 13 narrow routes were captured and checked for overflow/runtime errors. Final Teras 3/5 images were reinspected after the last empty-panel adjustment.

| Area | Assessment and evidence |
|---|---|
| Information architecture/navigation | Existing route structure preserved. Teras perspectives appear before the principal visual; linked source/definition/workspace detail is still discoverable. No new navigation tier. |
| Hierarchy/spacing/density | Material improvement: bounded records and collapsed evidence replace repeated large cards. Default pages now have a clear purpose and fewer competing sections. See height matrix and screenshots. |
| Consistency/readability | Shared disclosure/list patterns and BM display vocabulary are coherent with the established dark visual identity. Internal identifiers remain in technical validation/lineage detail, not erased from audit context. |
| Task clarity | Upload review states the next required actor. Action owner/date/status appear before its editor; completed records remain accessible separately. Demo role switching still needs a facilitator explanation. |
| Mobile | Registry/current-work/governance are meaningfully shorter, not merely stacked. Teras 2/3 remain the longest analytical pages (about three mobile screens), with secondary detail initially closed. At 320px perspective labels wrap and some validation/history tables need contained horizontal scrolling. |
| Accessibility | Native keyboard-operable disclosure, explicit names, focusable table alternatives and retained map table mode are supported by browser checks. Axe checks do not certify spoken output, all assistive technologies or every interaction state. |
| Stakeholder usability | Suitable for a facilitated walkthrough of interpretation → detail → action. Independent first-time ministry/NGO user comprehension has not been empirically tested. Do not present that as established fact. |

Evidence: `artifacts/screenshots/inspection.json` and the matching `desktop-*`, `mobile-*`, `reflow-*` PNGs. These are the final production-build captures. Browser regressions cover all 20 secondary Teras perspectives, source/responsibility disclosure, registry deep links and action pagination.

## Capability and safeguards retained

| Capability | Refinement outcome |
|---|---|
| Five Teras × need/process/outcomes/cost/satisfaction | Preserved; perspectives separated instead of competing on one page. Proposed metrics remain synthetic, not newly validated policy indicators. |
| National/state/district analysis | National/state preserved. District remains deliberately unavailable until valid data, denominators and boundaries exist. |
| Owner/source/period/status/version | Primary trust labels retained; deeper identifiers and version lineage disclosed on request. |
| Notes → decisions → assigned actions → closure evidence | Existing audited transitions and independent evidence verification retained and regression-tested. |
| Submission → scan/validate → attest → approve → publish → revise | Existing role separation, stale-version rejection, publication history and validation retained. |
| Threat Map | Layer choice, counts/rates, source, period, drivers, confidence, distinct missing/suppressed states and table alternative remain. Continuous numerical colour is not official threat zoning. |
| Responsibility | AADK across all Teras; JPPP/JRP/JPU associations; JKMD/MTMD and shared 4/5 responsibilities disclosed with validation caveats. |
| Security/privacy | No authentication, permission policy, DTO/API contract, suppression formula or database constraint changes. Private storage root can be explicitly namespaced by demo/test wrapper. Negative authorisation/database/export tests passed. |
| V1 boundary | Aggregate collaborative decision-support only. No individual case management, predictive policing or approved composite threat score added. |

This supports the refinement portions of FR-001–010 and ACC-006/020/028; it does **not** upgrade all partial entries in `docs/REQUIREMENT_STATUS.md` to accepted. The missing `requirements.md` and previously recorded source/definition/authority decisions remain unresolved.

## Regression evidence and commands

Bundled Node 24.19.0 was used. The Windows npm shim fails on the ampersand in the repository path, so package scripts were executed through their equivalent local CLI entrypoints. Prefix each command below with the bundled Node executable.

| Command arguments | Result |
|---|---|
| `node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs` | Passed, including final spacing adjustment |
| `node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0` | Passed, no warnings |
| `node_modules/typescript/bin/tsc --noEmit` | Passed |
| `node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts` | 36/36 unit/contracts passed, including source reconciliation and upload/security semantics |
| `node_modules/next/dist/bin/next build --webpack` | Production build passed; repeated after final one-line empty-panel styling hook |
| `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts` | Full production browser suite 46/46 and PostgreSQL/PostGIS 5/5 passed before the final styling-only hook |
| `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts tests/e2e/teras.spec.ts tests/e2e/refinement.spec.ts` | Final-build targeted browser suite 7/7 and database 5/5 passed after the hook |
| `node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts` | Final 39/39 captures: all HTTP 200, no page overflow, zero page runtime errors |
| `node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/demo-status.ts` | Curated business counts stable; no matching generated test actions |
| `git diff --check` | Passed; only Windows line-ending notices |

The last focused Playwright run replaces the default Playwright output directory; the earlier full-suite result is recorded here from its completed output, not misrepresented as a new 46-test run after the final styling hook. Final screenshots and inspection JSON are retained.

Before and after the full isolated E2E run, demo counts matched exactly: actions4, notes2, submissions2, saved views1, exports0, audit94, publications13; generated test actions0. After subsequent visual profile switching, audit increased legitimately to172 while every business count stayed the same. The audit log was not pruned to make the comparison look clean. Test runs remove only their generated database/private files; original demo evidence remains intact.

The current wrapper was restarted successfully: one Next server on loopback3000 and one direct worker process. Isolated3100 test server terminated normally. No production deployment was attempted.

## Remaining issues and demonstration conditions

No unresolved Critical/High **implementation defect blocking a facilitated local demo** was identified in this pass. This does not waive the following limitations:

- **Acceptance gap:** actual spoken screen-reader and representative stakeholder task testing remain pending. Required before claiming full V1 accessibility/usability acceptance; arrange an accessible walkthrough if needed for the demonstration audience.
- **Medium usability follow-up:** at320px, technical upload-preview/history tables still scroll inside their panels; map labels/legend and action-list header are compact. Prefer desktop for detailed validation/approval work. Wider mobile simplification should be informed by user testing, not additional controls.
- **Low refinement follow-up:** a few technical review terms/identifiers and repeated semantic caveats remain. Keep safety caveats until tested alternatives demonstrate equal clarity.
- **Policy/data limitations:** no approved zone thresholds/composite; no validated district analytical baseline; current committee/owner assignments and proposed KPI definitions still require stakeholder validation. Explain these explicitly; do not demonstrate unavailable values as if approved.
- **Operational conditions:** use the curated startup wrapper and synthetic accounts on loopback. Do not introduce real personal data or expose demo profile switching as production authentication. Production SSO/KMS/DR/integration/security assurance remain outside this pass.

Before presenting, confirm the facilitator can show the map/table alternative, switch among five perspectives, review the prepared submission under the correct roles, and open the completed action evidence. No additional product implementation is required for that controlled demonstration. Next milestone: stakeholder walkthrough plus the existing manual accessibility acceptance worksheet.

## File/output inventory

New: demo/test environment and curation/status scripts; shared disclosure, paginated record list, responsibility component, BM display helpers; refinement browser tests; this report. Changed: listed Teras/workspace/catalogue/Registry/governance/map pages and shared CSS/components; private-storage namespace option; startup/test scripts and guards; visual-height capture; README, operations guide and PLANS. Exact inventory is in the working-tree diff. No source/contract files or durable historical records were deleted.
