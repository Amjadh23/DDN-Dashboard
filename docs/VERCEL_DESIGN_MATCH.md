# Vercel reference design match — 7 October 2026

Milestone V1 implements the user's explicit request to match the chatbot and colour elements at https://ddndashboard.vercel.app/. Scenario Semasa remains the single combined overview/map page.

## Reference and changes

Inspected the deployed reference through its rendered page, computed styles, assets and public CSS. Theme source: `/_next/static/css/bca23d91d3be9d2d.css`; map/AIDA source: `/_next/static/css/27cf2e8c875a33aa.css`. Copied the observed theme overrides and component styles into `src/app/reference-theme.css` and `src/app/reference-components.css`, imported by `src/app/layout.tsx`. Charcoal background #141311, sidebar #111110, panels #1c1d20, blue accent #7496fb, pale KPI surface #e9ecf5 and blue/burgundy gradients match the reference.

The sidebar in `src/components/app-shell.tsx` uses the same AADK emblem and mission card. Public reference assets are copied as `public/aadk-logo.png` and `public/aida-avatar.svg`. Avatar SHA256: B86A580A9D784FCB7775F247D3F7A8A71A5E2847E8F7FD5D36FF34370D7FD4DF. Logo SHA256: 8E8826443C288DD980AE1C6A623D41A358CA46B8BC7452A8FBABC69D6CEC912B.

`src/components/mock-assistant.tsx` adds the reference AIDA avatar, launcher, panel, gradient header, greeting, question chips, bubbles, composer, reset and close controls. Responses are predefined local help, with filter-preserving navigation. Conversation lives only in component memory; no model call, storage or message transmission. Modal focus is trapped, background is inert, Escape closes and focus returns to the launcher. Messages render as text and input is bounded.

`src/lib/domain/map-palette.ts` and `src/components/threat-map.tsx` adopt the observed reference method `demo-relative-range-v1`: positive disclosed synthetic rates split their displayed min–max range into three equal intervals, using #268963 / #e4bd43 / #d24b5c. The legend exposes full-precision boundaries, formula and version. Text/icons accompany colours. Supplied annual rates, confidence and count layers remain distinct; this does not approve national thresholds. Zero, unknown, suppressed and unavailable values remain distinct and excluded from demo bands. Printed map metadata includes the method and synthetic label.

The only intentional motion difference is removing opacity fading from the reference entrance animation while retaining its movement. Full regression showed transient contrast failures while labels faded against darker backgrounds; settled colours are unchanged. `tests/e2e/overview.spec.ts` now checks exact removed page names so the sidebar mission link is not mistaken for a duplicate page.

## Validation

Commands use the bundled Node executable directly because the Windows npm shim mishandles the workspace ampersand. Relative CLI arguments:

```text
node_modules/prettier/bin/prettier.cjs --check src tests scripts database package.json tsconfig.json next.config.ts eslint.config.mjs
node_modules/eslint/bin/eslint.js src tests scripts --max-warnings 0
node_modules/typescript/bin/tsc --noEmit
node_modules/tsx/dist/cli.mjs --test tests/unit/*.test.ts
node_modules/next/dist/bin/next build --webpack
node_modules/tsx/dist/cli.mjs --env-file=.env.local scripts/e2e.ts
node_modules/tsx/dist/cli.mjs scripts/visual-qa.ts
node_modules/tsx/dist/cli.mjs scripts/print-qa.ts
```

New tests: `tests/e2e/design.spec.ts` checks exact colours/assets, mock controls, keyboard focus, no message network/storage, safe text, source/demo map distinction, WCAG scans and screenshots at 1440/390/320px. `tests/unit/map-palette.test.ts` checks full precision, zero/missing/suppressed/source/nonfinite exclusions and equal ranges.

The initial reference-token regression failed before implementation. The first full regression passed 52/58 and found six transient fade contrast failures; these prompted the animation correction. Formatting, zero-warning lint, strict TypeScript, production build and 41/41 unit tests passed. Visual QA captured 39 route/viewport combinations: all HTTP200, no runtime errors or page overflow. Final production browser suite 58/58 and isolated PostgreSQL/PostGIS checks 7/7 passed (2.0m); all six contrast regressions are resolved. Printed output: `artifacts/print/map-demo.pdf` and `map-print.png`.

Visually inspected the refreshed local app, desktop Scenario Semasa and desktop/mobile AIDA captures. Screenshots: `artifacts/screenshots/reference-match-{1440,390,320}.png`, `aida-{1440,390,320}.png` and all existing route captures. Local demonstration server was restarted against its existing database; no live database reseed/import/reset.

## Scope and acceptance

Requirement coverage: presentation of FR-001/002/003/009/010 and existing map/accessibility/disclosure requirements; no broader V1 completion claim. Data remains supplied aggregate weekly/annual evidence and structurally separate synthetic scenarios. AIDA content is mock navigation/help, not policy evidence or analytical findings. No protected source/meaning documents, schema, authorisation or official classification changed in this milestone. Existing unrelated annual-ingestion work is preserved.

Missing `requirements.md` remains recorded. Manual spoken screen-reader acceptance, official thresholds and broader governance/production acceptance remain deferred as previously documented. The generated print preview confirms method metadata and excludes AIDA; its existing dark map panels have low-contrast printed labels, so print accessibility is not claimed by this screen-design milestone and needs a separate print-layout refinement. No current screen-design blocker. PLANS.md records this milestone; next step is stakeholder review of the reference match.
