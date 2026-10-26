# DDN 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver the approved four-pillar dashboard without changing historical resource identities or permissions.
**Architecture:** A typed, versioned policy mapping sits above the five existing database domains. Canonical versioned routes render the existing domain capabilities; legacy routes redirect deterministically. Existing APIs keep domain semantics.
**Tech Stack:** Existing Next.js 16.4.0, React, strict TypeScript, PostgreSQL/PostGIS, Zod, Playwright and Node tests; no additional dependencies.
**Spec:** docs/superpowers/specs/2026-10-26-ddn2-restructuring-design.md (approved 26 October 2026, including routes).

## Global constraints

- Preserve original stored teras IDs, grants, source records, codes, publications and report snapshots.
- Four exact client titles; treatment and harm remain separately permissioned domains in pillar 2.
- No new predictive, clinical, agency-authority or policy-effective-date claims.
- Preserve pre-existing uncommitted work. PLANS.md is the durable execution ledger.
- Run integration tests in the existing isolated database runner, never reseed demonstration history.

## Review focus

- Old /teras/4 bookmarks must still reach harm, while new pillar 4 reaches international.
- Harm-only grants must not expose treatment, and vice versa, including map/source metadata.
- New grouping must not silently change old action/registry query meanings or upload v1 payloads.
- Frozen reports without taxonomy metadata remain readable; exports reauthorize original scopes.
- Long titles and domain switching must retain filters and keyboard/reflow access.

## Task 1 — D1: taxonomy and contract crosswalk

Files: create src/lib/domain/pillars.ts, tests/unit/pillars.test.ts; amend AGENTS.md, PROJECT_CONTEXT.md, SPEC.md, REFERENCES.md, README.md.
Interfaces: PolicyPillarId=1|2|3|4; LegacyDomainId=1|2|3|4|5; POLICY_MAPPING_VERSION; pillars metadata; pillarForDomain(number), domainLabel(number), domainHref(number), resolveDomain(pillar, requested, grants), legacyTerasHref(domain, params). Invalid input must not resolve to an authorized resource.

- [x] Write unit tests for complete mapping, exact titles, distinct harm/international links, valid context preservation, rejected unknown IDs and least-privilege merged selection.
- [x] Run `node node_modules/tsx/dist/cli.mjs --test tests/unit/pillars.test.ts`; expect missing-feature failure.
- [x] Implement mapping/helpers; revise contract current-page statements and record stable T4/T5 requirement crosswalk, preserving historical policy text.
- [x] Run focused tests and full unit suite; expect all pass. Record D1 result in PLANS.md.

## Task 2 — D2: canonical pages and navigation

Files: create src/app/ddn-2/teras/[id]/page.tsx; modify src/app/teras/[id]/page.tsx; src/components/{app-shell,illustrations,mock-assistant,threat-map,responsibility}.tsx; src/app/page.tsx; src/lib/domain/filters.ts; src/app/ember.css; tests/e2e/ddn2.spec.ts.
Interfaces: current routes use PolicyPillarId; existing TerasContent/scenario/source components receive LegacyDomainId. domainHref produces canonical paths (harm includes domain=harm). Page queries scope each domain before fetching/rendering data.

- [x] Add browser assertions for four titles, both pillar-2 subviews, all perspectives, legacy redirects, filter preservation and invalid routes.
- [x] Run focused browser test against baseline to observe missing canonical routes.
- [x] Compose existing page under canonical route, keeping per-domain visuals and source access; redirect legacy routes; update all generated page navigation.
- [x] Run types, unit tests and focused browser suite; check 320px and keyboard domain links. Record results.

## Task 3 — D3: metadata, workflows, collaboration and reports

Files: src/app/{indicators,data/catalog,actions,admin/governance}/page.tsx; src/components/{upload-workspace,action-workspace,governance-controls,reports-workspace}.tsx; src/lib/server/reports.ts; tests/unit/pillars.test.ts; tests/e2e/ddn2.spec.ts and reports/workflow tests.
Interfaces: v1 API teras remains LegacyDomainId; current registry uses pillar query, old teras retains domain filtering. Action creation retains one domain; combined list unions only authorized domain records. New saved snapshots add validated optional mapping metadata while historical snapshots have none.

- [x] Add tests for current registry union vs old query, template mismatch rejection, treatment/harm/international-only access and frozen report version metadata.
- [x] Observe relevant failures, then implement adapters and labels, grouped admin/upload choices, scoped action union and new report metadata.
- [x] Verify original source/domain IDs remain unchanged; run focused unit/database/workflow/report checks. Record results.

## Task 4 — D4: full verification and review

Files: adapt existing e2e URL/title expectations to canonical routing; scripts/visual-qa.ts; docs/DDN2_VALIDATION.md; docs/REQUIREMENT_STATUS.md; PLANS.md.

- [x] Run formatting, lint, strict types, all unit tests, production build, isolated database and complete E2E suite. Investigate failures rather than masking them.
- [x] Run visual QA for four pages and merged harm subview, inspect desktop/mobile/light/dark images, run axe and keyboard checks. Retain manual screen-reader limitations.
- [x] Obtain fresh whole-change review; resolve material findings with regression tests and rerun affected/full verification as warranted.
- [x] Record all changed files, commands, actual outcomes, stable requirement crosswalk, source status and unresolved production decisions; no full V1 acceptance claim.

## Commands and execution decisions

Use direct Node CLIs to avoid Windows npm shim issues on the ampersand path. Bundled Node executable: C:/Users/Muhammad Izzul Islam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe. Full commands are in PLANS.md. Explicit PowerShell file expansion is supported for unit tests.

Execution is inline with one independent final reviewer. User explicitly authorized plan and execution in the same run; no additional plan approval gate. Existing checkout is already a feature branch containing the approved baseline plus user edits; work remains here to preserve those changes and configured local services. No commits/stashing or detached clean worktree that omits user work. This is an intentional adaptation of the skill's isolation/commit scripts to repository preservation requirements. Record milestones in PLANS.md, retain review artifacts, and leave all changes reviewable.

## Completion — 26 October 2026

All four tasks completed. Final evidence: 46 unit, 7 PostgreSQL/PostGIS, 80 E2E, 39 light and 15 dark visual checks passed; formatting, zero-warning lint, strict types, production build and normal git diff --check passed. The build used Next's supported immediate retry after the separately recorded dependency reminder. Four Important review findings were regression-tested and fixed; no Critical finding or deferred review minor. No source/data/domain/grant migration or dependency change. Changes remain uncommitted in the existing feature branch to preserve mixed user work. Detailed report: docs/DDN2_VALIDATION.md. Separate dependency report: docs/NEXTJS_SECURITY_ADVISORY.md.
