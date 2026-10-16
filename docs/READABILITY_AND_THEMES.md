# Readability and light-first Ember

Date: 16 October 2026. Milestone R1. User authorised brainstorming and implementation of older-reader typography and a polished light/dark appearance.

Publication verification: before the requested push to `Amjadh23/DDN-Dashboard:design/ember-theme`, reran formatting, zero-warning lint, strict types, production build, 42 unit tests, 7 isolated database tests and the complete browser suite. All passed, including 63/63 browser tests in one run (3.2 minutes). The earlier run history below is retained for traceability.

## Design decision

Considered pure white, the existing ivory canvas, and a warm near-white canvas with white cards. Selected the third: `#faf9f7` canvas, `#ffffff` cards, `#e3ddd5` dividing edges, restrained warm background glows, and the existing dark sidebar/hero illustrations. This keeps the brand recognisable while making the light interface less yellow. Primary actions retain dark orange `#c2410c` with white text; smaller accent text uses `#b93c0c`. Bright orange is an accent, not the small-text colour.

Light is now the server-rendered default even on a dark device. An explicit `ddn-theme=dark` cookie preserves the user's choice across routes and reloads. Invalid preferences fall back to light. The toggle receives the server preference, avoiding a mismatched initial thumb/label. No new dependency or browser storage.

## Typography and layout

- Converted fixed font-size declarations in the four existing style layers to relative units. Supporting HTML text has a 0.875rem (normally 14px) floor instead of the previous 10–13px text.
- Body, principal explanatory prose and form inputs use 1rem (normally 16px); prose line spacing is 1.7. Display headings and large figures retain their hierarchy.
- Navigation uses 15px text, a wider 272px desktop sidebar, and 48px minimum rows.
- Main controls use 44px minimum heights. Filters wrap into labelled fields and become full-width on small phones. The map layer selector gets its own mobile row.
- Mobile Teras cards use compact left-aligned text with illustrations beside it. Metric grids reduce columns as space narrows.
- Existing map colours, evidence labels, suppression rules, routes, permissions and data workflows are preserved. AIDA user-message text now explicitly inherits the correct foreground in both themes.

## Changed files

Application: `src/app/{globals,reference-theme,reference-components,ember}.css`, `src/app/layout.tsx`, `src/components/app-shell.tsx`, `src/components/theme-toggle.tsx`.

Regression checks: `tests/e2e/design.spec.ts`, new `tests/e2e/readability.spec.ts`. Planning/report: `PLANS.md`, this document. Prettier also normalised existing formatting/line endings; no additional behaviour was changed. No source contracts, data files, schemas or dependencies were altered or removed.

## Validation method

Used bundled Node 24.19.0. Commands below are Node CLI equivalents of the package scripts:

```text
node node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
node node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
node node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts
node node_modules/next/dist/bin/next build --webpack
node node_modules/typescript/bin/tsc --noEmit
node node_modules/tsx/dist/cli.mjs --env-file=.env.local tmp/readability-e2e.ts --config tmp/readability-playwright.config.ts
```

Port 3100 was occupied by an unrelated application. Ignored temporary copies of the existing E2E runner/config used port 3210, preserving the generated PostgreSQL test database, worker/storage isolation and cleanup guards. The initial new tests failed on the missing light default and undersized text before implementation. One interim invocation used the previous production build; it is excluded from final evidence. A new enlargement assertion initially used an over-exact accessible-name selector; corrected it to the actual labelled combobox.

Results: production build, strict types, formatting, zero-warning lint, 42/42 unit tests and 7/7 isolated database checks passed. The full browser run passed 62/63; the sole failure was the CSS-zoom test model described below. After correcting it and refining upload-panel padding, rebuilt and reran `readability.spec.ts workflow.spec.ts`: 7/7 passed, including the 72-screen route sweep and controlled upload-to-publication/revision flow. The final build/types/format checks passed. No unresolved automated failures remain; this is combined evidence across the full and targeted runs, not a claim of a single 63/63 run.

Visually inspected light/dark desktop and mobile overview, AIDA, treatment, international collaboration, indicator registry, upload form, and 200% equivalent screenshots. All 72 route/theme/width captures returned HTTP200 without horizontal page overflow. Axe reported no violations in the tested states. Preview at http://127.0.0.1:3220 returned HTTP200 with the light theme and expected title. Changes remain local, uncommitted and unpushed.

Screenshots are generated under `artifacts/screenshots/readability-*`; the route sweep includes 12 pages × 3 widths (1440, 390, 320) × 2 themes. Desktop scans cover role-appropriate content in both themes; additional narrow-width scans cover the overview and AIDA. The enlargement model uses a 720×500 CSS viewport at 2× density, equivalent to a 1440×1000 display at 200% browser zoom. The initial CSS-zoom test was discarded because CSS zoom does not update viewport media queries. This is not a claim of exhaustive browser/assistive-technology testing.

## Traceability, data and limits

Presentation/accessibility work supports FR-009, VIS-001/002, MAP-028/029, NFR-020/021/022/023/024 and ACC-006/007/010. This is bounded presentation validation, not full V1 acceptance.

Tests use the existing supplied aggregate fixtures (Available), approved calculated rates (Derived), and separately labelled synthetic/demo scenarios. No new official values, thresholds, policy claims or personal data were introduced. The user's demo database is not reset or reseeded.

`requirements.md` remains absent. Older-user usability sessions, spoken screen-reader checks and cross-browser/manual print acceptance remain human acceptance work. A 14px supporting-text floor and 16px prose improve readability but cannot guarantee comfort for every visual impairment. SVG map labels scale with the map; the accessible ranked table remains the reading alternative.

Next milestone: stakeholder review of both themes with representative older readers, including their usual browser zoom/font settings.
