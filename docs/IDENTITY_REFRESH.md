# DDN Ember identity — 17 September 2026

User-authorised visual refresh based on the supplied orange-gradient dashboard reference.

## Design and files

- `public/ddn-mark.svg`: original five-part geometric emblem, representing the five connected Teras around a shared centre. Used in the sidebar and as the browser icon; no external asset or image dependency.
- `src/app/identity.css`: warm charcoal surfaces, soft orange atmosphere, gradient hero and sidebar feature, ivory evidence cards, orange featured total, chart fills, controls and motion respecting user preferences. Screen-only styles preserve existing print rules.
- `src/components/app-shell.tsx`: replaces the shield with the new SVG and adds a contextual strategic-map navigation card.
- `src/app/layout.tsx`: imports the identity stylesheet and sets the SVG favicon.
- `PLANS.md`: records implementation and verification milestone completion.

No metric values, source classifications, role permissions, map colour scales, backend or scanner behaviour changed. Supplied aggregate values retain their source metadata; synthetic scenarios retain DEMO / SYNTHETIC labels.

## Verification

- `npx prettier --write src/app/identity.css src/app/layout.tsx src/components/app-shell.tsx`: passed. Initial inclusion of SVG reported no inferred parser; SVG was subsequently loaded and visually verified by Chrome.
- `npm run format:check`: passed.
- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, including TypeScript and all route compilation.
- `node .runtime/identity-qa.mjs`: final 39/39 route and viewport checks passed at 1440, 390 and 320 CSS pixels. Each returned HTTP 200 with no page errors, horizontal overflow or WCAG-tagged axe violations. Uploads, reports and governance checked with contributor, analyst and organisation-admin demo profiles respectively. Expanded Teras 2 details also passed axe at all widths; mobile navigation successfully returned to overview.
- `node .runtime/identity-keyboard.mjs`: keyboard skip link, visible focus indicator, Enter-operated metric details and reduced-motion behaviour passed.

Visual review found and corrected flex compression in the sidebar feature and a funnel-fill override. An initial expanded-details test timed out because it retained the administrator profile; the test now switches to executive before checking KPI details.

Screenshots: `artifacts/identity/{1440,390,320}-{overview,teras-2}.png`, mobile navigation screenshots and `artifacts/identity/qa.json`. Original source tree remains in the Desktop project folder. No files deleted.

Requirement support: FR-001/003/009/010, VIS-002, NFR-020/021/022/023, ACC-007/010. These checks support this presentation change, not new claims of full product acceptance. Upload scanning still requires the repository's Windows Defender integration; backend/database/workflow suites were not rerun for this CSS/brand change. Full manual screen-reader and stakeholder acceptance remain open. Next step is user review of the new visual identity.
