# Outstanding manual accessibility acceptance

Status: **not performed**. This is a review worksheet, not a passing test result.

`SPEC.md` ACC-006 requires automated checks plus keyboard, screen-reader, zoom/reflow and colour-independent manual review. Automated Axe, keyboard interactions and responsive checks have passed. This environment cannot operate and assess a native screen reader; an accessibility reviewer must supply the spoken-output evidence. No waiver or contract amendment is assumed.

Use the running local application at http://127.0.0.1:3000. Use only the provided fictional profiles, downloadable demo templates and synthetic content. Keep the worker running for upload validation (see OPERATIONS.md).

Record reviewer, date, operating system, browser/version, screen reader/version and settings. For every row, record actual announcements, pass/fail and a reproducible defect. The expected behaviour describes the required review, not an assertion that it already works.

| Journey | Expected accessible behaviour | Result / evidence |
|---|---|---|
| Overview: skip link, landmarks, navigation and filters | Meaningful focus order; skip link reaches main content; headings and selected filters are announced | Not reviewed |
| Map: select a state, switch layer/count/rate and use the ranked table | Selection, units, period, synthetic status and disclosed values are understandable without relying on colour or SVG alone | Not reviewed |
| Map: zero, unknown, not collected, not applicable and suppressed examples | Each state is distinguishable; no suppressed value is announced | Not reviewed |
| All five Teras: change perspective, open chart table/definition and scroll a matrix | Selected perspective is announced; chart/table values have units and headers; scroll region is reachable and escapable | Not reviewed |
| Indicator registry and source catalogue | Search results, expandable definitions, source, owner status, freshness and version can be located and read | Not reviewed |
| Contributor: download demo template, upload an invalid file, then a valid file | Labels, validation errors and eventual worker status can be found without visual searching; no false success | Not reviewed |
| Steward, approver and secretary: attest, independently approve and publish | Current state, required reasons, denied operations and successful transitions are understandable; focus remains usable | Not reviewed |
| Actions: create contextual note/action, submit evidence and independently close | Field labels, errors, revision conflicts, owner and closure status are understandable | Not reviewed |
| Analyst: save report, export and revisit private history | Classification, frozen context, output format, download availability and errors are announced coherently | Not reviewed |
| Mobile navigation and 200%/400% zoom | Menu state is announced; all controls remain reachable; tables scroll without trapping keyboard focus | Not reviewed |

Return completed results and any defects to this task. Fixes must receive focused regression checks before ACC-006 can be marked accepted. This worksheet does not resolve the separate KPI/data, performance and governance items in VALIDATION.md or the per-ID requirement inventory.
