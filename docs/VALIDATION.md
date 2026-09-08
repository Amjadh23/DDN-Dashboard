# V1 validation and acceptance record

Assessment date: 8 September 2026. Contract: `SPEC.md`, with repository behaviour governed by `AGENTS.md`. This report concerns the local governed prototype, not a production national system.

## Outcome

The local implementation includes all13 major routes, five distinct Teras experiences, the state threat map, source/definition catalogue, controlled upload-to-publication/revision workflow, collaboration, saved reports, exports and scoped demo administration. The final matrix accessibility defect is fixed: scroll containers now expose a labelled keyboard-focusable region. Every secondary-perspective test verifies the requested perspective is actually selected.

**Full V1 acceptance is not claimed.** Automated/local verification is recorded below; the manual screen-reader portion of `ACC-006` remains unperformed. The requirement matrix deliberately retains partial and conditional statuses rather than treating a passing browser suite as proof of all228 requirements. Clinical, ownership, threat-method and production decisions remain visible in `/admin/governance`.

## Commands and evidence

Commands run from `Z:\R&D\Dashboard Dadah`. Validation used the bundled Node24.19.0 executable at `C:/Users/Muhammad Izzul Islam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`; package scripts are the convenient equivalents below.

| Check | Exact local CLI invoked with bundled Node | Latest outcome |
|---|---|---|
| Formatting | `node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs` | Passed8Sep |
| Lint | `node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0` | Passed8Sep; no warnings |
| Strict types | `node_modules/typescript/bin/tsc --noEmit` | Passed8Sep |
| Unit/contracts | `node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts` | 36/36 passed8Sep |
| Database/PostGIS | `node_modules/tsx/dist/cli.mjs --env-file=.env.local --test tests/database/*.test.ts` | 5/5 passed8Sep |
| Focused secondary views | `node_modules/@playwright/test/cli.js test tests/e2e/perspectives.spec.ts` | 5/5 passed8Sep, exercising20 secondary views at320px |
| Complete browser suite | `node_modules/@playwright/test/cli.js test` | 40/40 passed8Sep against the production build, including all20 secondary views |
| Production build | `node_modules/next/dist/bin/next build --webpack` | Passed8Sep, including Next type checking |
| Production server | `node_modules/next/dist/bin/next start --hostname 127.0.0.1` | Serving loopback3000 |
| Visual inspection | `node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts` |39/39 route/viewport checks passed; HTTP200, no page overflow or runtime errors; `artifacts/screenshots/inspection.json` |
| Print check | `node_modules/tsx/dist/cli.mjs scripts/print-qa.ts` | Disclosed demo map PDF and print screenshot generated |
| Requirement inventory | `node_modules/tsx/dist/cli.mjs scripts/requirement-report.ts` |228 SPEC IDs recorded |

Equivalent package scripts: `format:check`, `lint`, `typecheck`, `test:unit`, `test:db`, `test:e2e`, `build`, `start`, `qa:visual`. Windows Defender scanning is exercised by the actual isolated parser test, not a mock success.

After the full suite, final print inspection identified faint safeguard-card text. A print-only CSS correction was followed by another successful production build/type check, format check and regenerated PDF/PNG visual inspection. The complete browser suite predates this isolated print correction; screen styles and application behaviour were unchanged. Production server and worker were restarted for stakeholder review.

## What the checks prove

- Formula/semantic tests cover null/zero denominators, period change, incompatible definitions/boundaries/cohorts, primary/secondary suppression, confidence missingness and refusal to classify unapproved thresholds.
- Source tests reconcile headline, treatment-setting, demographic, geography, complaint and arrest aggregates to the visually reviewed supplied snapshot. Ambiguous combined W. Persekutuan remains combined; no allocation to territory polygons is invented.
- Database tests use actual PostgreSQL/PostGIS: spatial containment, synthetic/official separation, immutable publication/audit and role/organisation/geography isolation.
- Workflow tests exercise short-lived upload targets, reuse denial, private quarantine, real scanning, isolated CSV/XLSX validation, steward attestation, independent approval, secretary publication, map refresh and preserved revision history. Viewer uploads and foreign origins are rejected.
- Collaboration tests cover evidence-required review, stale revisions, independent closure and denial of business-role administration.
- Report tests cover frozen disclosed snapshots, CSV/XLSX generation, actor-private history/downloads, separate supplied and DEMO / SYNTHETIC labels, version metadata, and reauthorisation after scope changes/session revocation.
- Browser checks cover12 fictional role profiles,13 major routes, five Teras, source controls, partner keyboard selection, skip navigation, map/table alternative, no runtime errors, responsive reflow and automated accessibility. Secondary-view coverage includes process, outcomes, cost and satisfaction. Axe targets WCAG2A/2AA/2.1AA/2.2AA; this is not WCAG certification.

## Visual refinement and outputs

Screenshots are in `artifacts/screenshots/`: `desktop-*`, `mobile-*`, `reflow-*`, plus `reflow-teras-{1..5}-{process,outcomes,cost,satisfaction}.png`. Main widths are1440,390 and320 CSS pixels. Upload, reports and admin captures use contributor, analyst and organisation-admin profiles respectively.

Reviewed and corrected shared text contrast, map title hydration, mobile matrix overflow, keyboard focus for scrollable matrices, misleading supplied-source wording on Teras4/5, source-setting navigation, report filter labels, map provenance/driver details and print contrast. Registry definition tables collapse to keep the catalogue navigable. Saved report histories scroll within bounded panels. Print output retains synthetic classification, period, geography, layer, publication/definition/boundary and interpretation caveats.

`artifacts/print/map-demo.pdf` and `map-print.png` are illustrative print artifacts, not signed or approved official reports. `artifacts/test-results/playwright/index.html` contains the browser report. Failed-run traces may remain alongside later successful artifacts; the latest report/log determines status.

## Evidence status and data limits

Supplied aggregate statistics are **Available**, with original PDFs unchanged in `data/` and `references/`. Policy responsibility statements preserve **explicitly assigned**, **policy-listed** and **requires stakeholder validation** distinctions. All unsupported geographic, service/outcome and international scenarios are **Proposed / DEMO / SYNTHETIC** and cannot publish as official. Official rates, zone thresholds, composites, recovery definitions and district rollout are gated.

There is one official source date. Sample populations and2017 demo boundaries are not an approved official denominator/boundary baseline. Scenario charts are illustrative datasets; they do not establish programme impact or comprehensive production KPI coverage. The26 publishable registry definitions have metadata; additional non-publishable scenario cards disclose their demo interpretation inline. Complete approved operational definitions and data contracts remain stakeholder work.

## Remaining acceptance work and limitations

1. **Manual screen-reader acceptance (`ACC-006`, supporting `NFR-020`)**: not performed. A reviewer must exercise the overview/map table, keyboard state selection, source/definition details, upload errors, review/publication, action evidence/closure and export history using the accepted screen-reader/browser combination. Record technology versions, route/profile, expected announcement, actual result and any defect. Browser accessibility-tree/axe checks are not a substitute for this review.
2. **Representative performance (`NFR-025..026`)**: production build and local route behaviour are verified, but p75 LCP/INP/CLS under agreed user devices/network conditions have not been measured. Local response observations must not be presented as field percentile evidence. Fonts currently use Google Fonts with system fallbacks.
3. **Detailed KPI/data acceptance**: `FR-040`, detailed `FR-T*-*`/`DATA-T*-*`, `DATA-040` and related page acceptance contain requirements broader than the bounded fixtures. Unsupported filters explain their unavailability; generic aggregate templates do not constitute every production programme/episode/service contract. Anomaly/coverage policies, dosage/fidelity, approved recovery/clinical/legal definitions and complete operational feeds require validated definitions and scope. See the per-ID matrix; these are not silently marked satisfied.
4. **Production controls**: actual IdP/MFA, hosting/residency, OS sandbox/container policy, storage, retention/deletion, backup/recovery, operational observability, penetration/privacy/legal review and authority to process sensitive data remain unconfigured. Large exports and external notifications/integrations are unavailable. Expired encrypted files remain locally pending approved retention; the API refuses expired download access.
5. **Source/repository prerequisites**: `requirements.md` is absent and source paths differ from contract examples. There is no `.git`; no diff/commit history can be produced. The world-map acquisition revision was not retained by the earlier interrupted work; its local SHA256 and provenance limitation are documented in `docs/source-register.md`.

## Files in this finishing run

Application fixes: `src/components/charts.tsx` (focusable scroll regions) and `src/app/globals.css` (print contrast for the map safeguard cards). Regression refinement: `tests/e2e/perspectives.spec.ts`. Formatting: `scripts/requirement-report.ts`. Acceptance documentation: `docs/VALIDATION.md`, `docs/REQUIREMENT_STATUS.md`, `docs/MANUAL_ACCEPTANCE.md`, `PLANS.md` and README status. Generated outputs: browser reports, screenshots and print artifacts. No contract, supplied PDF, published source value or existing publication was deleted or rewritten.

Previous implementation changes are enumerated by milestone in `PLANS.md`; setup/worker/security limitations are in `docs/OPERATIONS.md`. No source-file diff is fabricated in the absence of Git metadata.
