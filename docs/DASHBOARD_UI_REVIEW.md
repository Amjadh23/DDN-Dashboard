# Dashboard interface review — 17 October 2026

Status: review complete; fixes not implemented. This is an inspection of the current working tree, including pre-existing uncommitted changes, rather than a fresh contract-acceptance run.

## Scope and method

Read AGENTS.md, PROJECT_CONTEXT.md, SPEC.md, REFERENCES.md and README.md. `requirements.md` is absent, as already documented in PLANS.md. Inspected the executive overview and all five Teras in the local browser, including a 390 × 844 mobile viewport and light/dark overview presentation. Corroborated findings against source. The normal desktop viewport was approximately 1265 × 712. Used the default fictional executive profile and existing aggregate supplied/synthetic demonstration data. Did not change business records, upload files or publish data.

No automated suite, production build, source-PDF reconciliation, screen-reader acceptance or security penetration test was run. Successful local page loads do not establish any of those acceptance outcomes.

## Confirmed functional issues

### UI-01 — Selected state is lost when opening its related Teras (P2)

Reproduction: on Scenario Semasa, search for Perak and select the result. The URL gains `state=MY-08` and the detail panel shows Perak. Click `Teroka Teras berkaitan`. The destination contains `geography=MY` and no state selection, and its geography control shows Seluruh Malaysia.

Cause: `src/components/threat-map.tsx` builds this link using `filterQuery(filters)` without the active selected state. The action-creation link immediately above does use `active`, so the two drill-through paths disagree.

Recommendation: carry the selected state into the destination's geography and retain period/source context. Verify the resulting scope and displayed values together. Related requirements: FR-003, FR-041, MAP-025.

### UI-02 — Sidebar navigation resets analytical context (P2)

The main navigation links in `src/components/app-shell.tsx` use bare paths. After choosing a state/period, moving through the sidebar opens the next page's defaults. The overview's Teras cards preserve query filters, creating inconsistent behavior between navigation entry points.

Recommendation: preserve applicable shared filters, explicitly resetting only dimensions that do not apply. Related requirements: FR-003, FR-041, FR-042.

### UI-03 — International partner map silently ignores state selection (P2)

Reproduction: on Teras 5 choose Perak. The URL and geography filter change to MY-08, but the world map, all five partners and partner details remain identical. `PartnerMap` receives only geometry, uses a static partner array and has a hard-coded national action link.

Recommendation: disable geography for this visual with a plain explanation of its national scope, or implement a meaningful supported relationship between partners and state-scoped commitments. Do not invent that relationship. Related requirement: FR-042.

### UI-04 — Overview Teras cards carry an inappropriate map layer (P2)

All five cards in `src/app/page.tsx` carry the current `layer` unchanged. With the default burden layer, the Penguatkuasaan and Pengurangan kemudaratan cards open Teras 3 and 4 with `layer=burden`. Opening those same pages from the sidebar defaults to supply and harm, respectively. `src/app/teras/[id]/page.tsx` only assigns a page-specific default when the query has no layer.

Recommendation: deliberately choose each Teras's relevant default layer on cross-Teras navigation, or clearly preserve an intentional user layer choice. Verify entry-point consistency. Related requirements: VIS-T3-001, VIS-T4-001.

## Confirmed presentation issues

### UI-05 — Arbitrary subset of permanent state labels (P2)

`src/components/threat-map.tsx` explicitly limits permanent labels to MY-01, MY-03, MY-12 and MY-13: Johor, Kelantan, Sabah and Sarawak. This is neither the selected-state rule nor an evident ranking rule. It gives those states unexplained prominence.

Recommendation: adopt one coherent labeling policy. On this crowded map, show the selected/hovered state and introduce all labels at sufficient zoom with collision handling; alternatively provide an explicit all-labels toggle and callouts for small states/territories. Simply adding every full name at the current scale would overlap. These are states/federal territories, not countries. This is a design consistency finding; the contract does not require all names permanently visible.

### UI-06 — Map geography is small inside a very tall canvas (P2)

On the desktop full map, measured `.map-canvas` at approximately 639 × 698 CSS pixels while `.malaysia-map` was approximately 639 × 259. The map is vertically centered in the remaining space, with large blank areas and controls distant from the geography. The full workspace was approximately 934 pixels tall. The long right-hand details column stretches the grid; the SVG retains its own wide aspect ratio.

Recommendation: size the geography workspace independently of the full detail-column height; use a compact summary and expandable detail, or a deliberate responsive map aspect ratio. Ensure the map and its legend are readily inspectable together. Related requirement: MAP-020.

### UI-07 — Desktop filter values are clipped (P2)

At the normal desktop viewport, selected values such as `Seluruh Malaysia` and `Tiada perbandingan` are visibly cut off. The issue appears in light and dark themes. Individual selects were only about 179 pixels wide, including padding and the dropdown affordance. The 390-pixel stacked layout displayed these values more clearly.

Recommendation: let the desktop row wrap earlier or allocate sufficient width to each select; check longer state names and annual-period labels. Related requirement: FR-003.

### UI-08 — Floating AIDA prompt covers dashboard content (P2)

The expanded launcher sits over the lower-right complaint KPI on the overview and overlaps treatment follow-up/detail text while scrolling. It has no dismiss control while collapsed. Its compact mobile form is less obstructive.

Recommendation: use a smaller launcher, provide a dismiss/minimize control, or reserve a safe area that prevents overlap with important figures and controls.

### UI-09 — Partner-map labels collide near Malaysia (P3)

The `MALAYSIA` label overlaps the nearby Indonesia/B region in the Teras 5 world map. Small single-letter markers require users to repeatedly consult the button row. The map background and country boundaries are also faint in dark mode; this is a visual observation, not a measured contrast failure.

Recommendation: reposition labels with callouts and use a regional inset or zoom for ASEAN. Check light/dark legibility and keyboard focus with the refined layout. Related requirement: VIS-T5-001.

### UI-10 — Map hover disclosure is incomplete (P2)

The custom tooltip in `src/components/threat-map.tsx` shows name/rank, the selected value, relative band, completeness and evidence label. It does not expose the full count-plus-rate, denominator, period, comparison and refresh information required by MAP-024. Some of that information is available in the separate selected-state panel, but hover itself remains incomplete.

Recommendation: show a concise common tooltip/tap summary containing the required context and provide full metadata on selection. Preserve disclosure controls and a keyboard/table alternative. Related requirement: MAP-024.

## Further polish recommendations

- Large repeated hero and sidebar promotional panels push analytical content below the initial viewport. Compact them on analytical pages; retain the illustrated identity where it helps orientation.
- On mobile, the geography and tiny state labels become difficult to read. Preserve the table alternative and offer an obvious route to the full interactive map; do not solve this with permanently overlapping text.
- Teras 5 uses English country names `Japan` and `Germany` inside a BM-first interface. Add localized display names independently of geometry/source identifiers (FR-009).
- Prioritise KPI cards deliberately rather than taking the first four code-sorted definitions. For example, the treatment page puts district count before institutional clients; this is an editorial recommendation, not an incorrect-value finding.

## What already works in the inspected views

Supplied headline figures and synthetic map scenarios are visibly separated. The map has a table alternative; unknown, suppressed and zero states have distinct explanations. The demo colour method is disclosed rather than presented as an approved official threat threshold. Those safeguards should remain through visual refinement.

## Recommended bounded follow-up

First fix UI-01 through UI-04 as a navigation/filter milestone with focused browser regressions. Then address map labeling, map sizing, filter clipping, tooltip disclosure and launcher overlap as a separate interface milestone. Stakeholder decisions about official thresholds, boundaries, responsibility or missing datasets remain outside this review.

## Inspection environment notes

The app and database were initially stopped. `npm run dev` failed on the Windows shim/path resolution (`Z:\tsx\dist\cli.mjs`); direct `node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/demo.ts --dev` started Next.js. The documented database start command initially used PostgreSQL's 5432 default, whereas the application expects 55432. Restarting that same local instance with `-o '-p 55432'` enabled the reviewed pages. No migrations, reseeding or dependency installation were performed. Development startup's generated edits to AGENTS.md and next-env.d.ts were restored to their pre-review content.
