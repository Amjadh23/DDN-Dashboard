# Dashboard interface remediation — 17 October 2026

## Scope

User-authorised implementation of the findings in DASHBOARD_UI_REVIEW.md. R1 covers navigation and filters; R2 covers map labels, layout and polish. No source contracts, data, formulas, thresholds, permissions or database schema were changed. Existing unrelated working-tree edits were preserved. requirements.md remains absent.

## Resolution

| Finding | Change |
|---|---|
| UI-01 | Related Teras link carries the selected state and shared analysis filters. |
| UI-02 | Sidebar preserves recognized analytical filters, including the selected map state; workflow/private query parameters are excluded. |
| UI-03 | Teras 5 uses national geography, disables its geography control and explains the scope. No state-to-partner relationship was invented. |
| UI-04 | Overview cards and sidebar consistently select supply for Teras 3, harm for Teras 4, and burden otherwise. |
| UI-05 | Removed all permanent state names from the SVG. Every state has the same hover/focus identification, selectable summary and searchable/table alternative. No arbitrarily favoured subset remains. |
| UI-06 | Map uses the full panel width with an intrinsic-height canvas; summary, measures and follow-up sit in columns below, stacking on narrow screens. |
| UI-07 | Filter fields wrap earlier with adequate minimum widths; shortened the demo-period option without removing its demo label. |
| UI-08 | AIDA launcher is in the header. Its modal is portalled outside the inert application frame, preserving focus trapping and return focus. |
| UI-09 | Partner labels use leader lines, fuller country identification, relocated Malaysia text and stronger dark-theme land/boundaries. |
| UI-10 | Hover discloses count, rate/unit, denominator, period, comparison availability, rank, status, completeness/confidence, source and refresh date, using already disclosed DTOs. |
| Polish | Smaller hero/sidebar branding, no tiny permanent state names on mobile, Jepun/Jerman localization, and explicit weekly treatment-card ordering (total, institution, community, districts). |

## Files

Changed application files: src/lib/domain/filters.ts; src/components/app-shell.tsx, filters.tsx, threat-map.tsx, partner-map.tsx, mock-assistant.tsx; src/app/page.tsx, teras/[id]/page.tsx, ember.css.

Created tests/e2e/interface-review.spec.ts. Updated tests/e2e/teras.spec.ts to expect the deliberately localized partner label. Updated PLANS.md and the audit status. Created this report. No files deleted.

## Validation commands

Used bundled Node 24.19.0 because the system Node 20 runner does not expand the database-test glob, and the npm shim mishandles the ampersand in the repository path. Commands were executed via the bundled node.exe:

- node_modules/next/dist/bin/next build --webpack
- node_modules/typescript/bin/tsc --noEmit
- node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
- node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
- node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts
- --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/e2e.ts

The E2E wrapper uses a disposable isolated database and server on port 3100, including migrations, synthetic seed, annual-source reconciliation and database assertions. It never runs mutation tests against the demo database. PostgreSQL was started on the documented local runtime port 55432.

Regression-first evidence: all four R1 tests failed for the reproduced navigation/filter defects before implementation and passed afterward; the two initial R2 checks failed for the floating launcher and stretched canvas before implementation. The first broad run passed 68/69 tests; the sole failure was an old exact English partner-label expectation, updated for the intentional localization. Final results are recorded below after validation.

## Requirements and limits

Changes address FR-003, FR-041, FR-042, VIS-T3-001, VIS-T4-001, VIS-T5-001 and MAP-020, MAP-024, MAP-027/028 presentation/navigation behavior. This report does not assert full acceptance of those requirements beyond the tested behaviors or of the whole V1 contract.

Data: existing supplied aggregate source snapshots and structurally separate DEMO / SYNTHETIC scenarios. No personal or new official data. Hover freshness comes from the same existing source refresh dates used by the selected-state detail. Completeness remains distinct from approved confidence. Existing suppression, missing/zero states, and source distinctions remain enforced server-side.

No remaining audit item requires a policy decision. District boundaries/denominators, official threat thresholds, comprehensive confidence and production acceptance remain governed prerequisites outside this UI remediation. Next step is stakeholder visual acceptance; any new product change should have its own bounded milestone.
