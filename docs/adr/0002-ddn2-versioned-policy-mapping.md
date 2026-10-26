# ADR 0002 — Version policy presentation, preserve resource domains

Status: accepted by the human on 26 October 2026, including the versioned routes.

The client mapping combines treatment and harm reduction into current Teras 2 and moves international cooperation to current Teras 4. Existing integer `teras` fields are already embedded in immutable observations, definitions, publications, grants, submissions and saved report resources. Renumbering them would change provenance and access semantics.

Use `ddn2-client-2026-10-26` as an application mapping revision, with typed current pillar IDs 1–4 above original domain IDs 1–5. The mapping is 1→1, 2→2, 3→3, 4→2, 5→4. The application revision is not a legal policy commencement date. Canonical routes use `/ddn-2/teras/1..4`; legacy links redirect according to original domain meaning.

Treatment and harm remain separate selectable subviews and permission scopes. Existing API v1 payloads, templates, stored records and KPI codes retain domain IDs. UI selectors group those domains beneath four headings. Current registry filtering uses `pillar`; historical `teras` queries still select one original domain.

Scenario/source reads use the selected domain. Map layers use the viewer's original session and the existing DAL/RLS checks because permitted context can belong to another domain (for example, prevention's burden map). This preserves contextual capabilities without broadening any grant. The page's availability check uses permitted geographies, allowing state-scoped users to reach the geography selector even when opening a default national URL.

New saved reports record the mapping version as optional additive metadata within the existing snapshot schema. Snapshots without it remain historical; unknown mapping versions fail closed. Original report resources remain the download-time authorization boundary.

No database migration, source reclassification, new KPI, forecasting feature or agency reassignment is needed. Stable T4/T5 requirement IDs retain harm/international meaning and are crosswalked to their new page locations. The cost is an explicit distinction between policy pillar and data domain at UI boundaries; typed helpers and compatibility tests enforce it.
