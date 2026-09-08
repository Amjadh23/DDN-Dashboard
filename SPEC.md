# Version 1.0 Product Specification

## 1. Document Control

**Product:** National Drug Policy Collaborative Dashboard  
**Release:** Version 1.0 discovery prototype / stakeholder-validation baseline  
**Status:** Initial build contract; unresolved items remain explicitly marked  
**Normative context:** `PROJECT_CONTEXT.md`  
**Detailed discovery:** `requirements.md`  
**Source rules:** `REFERENCES.md`

This specification defines what Codex must build for V1. It deliberately does not define the implementation sequence; Codex must create `PLANS.md` after repository inspection.

## 2. Normative Language and Evidence Status

- **MUST**: required for a credible and safe V1.
- **SHOULD**: strongly recommended; omission requires a recorded reason.
- **MAY**: optional or deferrable.

Every KPI, dataset and material visual must carry one evidence status:

| Status | Meaning |
|---|---|
| Policy | Explicitly required or clearly implied by the DDN 2017. |
| Available | Populatable at least partly from the supplied weekly AADK report. |
| Derived | Calculated from available data using an approved denominator/formula. |
| Proposed | Requires new data, a new workflow or a survey. |
| Validation required | Definition, ownership, target, threshold or authority is unresolved. |

## 3. Product Scope

### 3.1 In scope

- **FR-001:** The application MUST provide an executive overview and one page for each of the five Teras.
- **FR-002:** It MUST provide a strategic Malaysia map with state-level views and conditional district drill-down.
- **FR-003:** It MUST provide consistent, URL-addressable filters and comparisons.
- **FR-004:** It MUST support controlled CSV/XLSX submission, validation, review, approval, publication and revision.
- **FR-005:** It MUST expose an Indicator Registry and Data Catalogue.
- **FR-006:** It MUST support organisation-scoped access, immutable audit history and segregation of duties.
- **FR-007:** It SHOULD support contextual comments, decisions, accountable actions and saved views.
- **FR-008:** It MUST support disclosure-safe exports of approved aggregate views.
- **FR-009:** It MUST be BM-first and structurally ready for English localisation.
- **FR-010:** It MUST distinguish official, provisional, revised and synthetic/demo data.

### 3.2 Non-goals

- **FR-011:** V1 MUST NOT be a person-level case-management system.
- **FR-012:** V1 MUST NOT replace operational systems belonging to AADK, police, health, prisons, customs or other agencies.
- **FR-013:** V1 MUST NOT publish exact person, treatment, incident or investigation locations.
- **FR-014:** V1 MUST NOT perform predictive policing, automated suspicion scoring, facial recognition or individual enforcement recommendations.
- **FR-015:** V1 MUST NOT claim that a correlation proves programme impact.
- **FR-016:** V1 MUST NOT provide unrestricted generative-AI access to row-level sensitive data.

## 4. Roles and Authorisation

### 4.1 Required roles

- **FR-020:** The access model MUST support executive viewer, analyst, agency contributor, data steward, reviewer/approver, programme manager, restricted analyst, committee secretariat, auditor, organisation administrator, platform administrator and indicator administrator roles.
- **SEC-001:** Effective permission MUST be evaluated as role × organisation × geography × dataset/Teras × sensitivity × workflow state.
- **SEC-002:** Permission checks MUST occur server-side at every read, search, mutation, object download and export boundary.
- **SEC-003:** Viewing, uploading, submitting, approving, publishing, administering and exporting MUST be separable permissions.
- **SEC-004:** A submitter MUST NOT approve their own submission.
- **SEC-005:** Platform administration MUST NOT automatically grant access to sensitive business data.

### 4.2 Principal journeys

- **FR-021:** A national user MUST be able to identify a worsening zone, inspect its drivers/confidence and create an action.
- **FR-022:** A state user MUST be able to compare authorised districts, populations, programmes and service gaps.
- **FR-023:** A contributor MUST be able to obtain the correct template, upload data and resolve actionable validation errors.
- **FR-024:** A steward MUST be able to attest source, coverage and quality before submission.
- **FR-025:** An independent reviewer MUST be able to approve or reject a version with a recorded reason.
- **FR-026:** An analyst MUST be able to compare approved periods, save a view and export only disclosure-safe values.
- **FR-027:** An auditor MUST be able to inspect immutable submission, approval, permission and export events without mutating data.

## 5. Information Architecture

The implementation MUST provide or deliberately phase these routes:

| Route | V1 purpose |
|---|---|
| `/` | Executive overview and cross-Teras alerts. |
| `/teras/1` | Pendidikan Pencegahan. |
| `/teras/2` | Rawatan dan Pemulihan. |
| `/teras/3` | Penguatkuasaan. |
| `/teras/4` | Pengurangan Kemudaratan. |
| `/teras/5` | Kerjasama Antarabangsa. |
| `/map` | Full-screen map and comparison workspace. |
| `/data/uploads` | Templates, submissions, validation, approval and versions. |
| `/data/catalog` | Dataset ownership, freshness, fields and lineage. |
| `/indicators` | KPI definitions, formulae, targets and versions. |
| `/actions` | Cross-agency actions and closure evidence. |
| `/reports` | Saved views and export history. |
| `/admin/*` | Scoped reference and access administration. |

- **FR-030:** Every Teras page SHOULD show page purpose, responsible status, refresh time, KPI cards, a primary strategic visual, trend/comparison panels, a ranked table, quality/coverage, notes/actions and source/formula/caveat access.
- **FR-031:** Every page SHOULD organise relevant indicators through needs, process, outcome, cost and satisfaction perspectives.
- **VIS-001:** Technical terminology MUST have plain-BM explanations.

## 6. Shared Filters and Metric Behaviour

- **FR-040:** Filters MUST support reporting period, comparison period, authorised geography, organisation/provider, programme/intervention, facility/setting, substance, approved demographic dimensions, pathway, data status, count/rate/percentage mode, source and confidence.
- **FR-041:** Filter state MUST be shareable through the URL without exposing secrets or sensitive identifiers.
- **FR-042:** A filter that does not apply MUST be disabled with an explanation rather than silently ignored.
- **DATA-001:** Counts, percentages, percentage-point changes, population rates, cohort rates and index scores MUST be labelled distinctly.
- **DATA-002:** Population rates SHOULD default to per 100,000 and MUST disclose denominator source/year/version.
- **DATA-003:** A zero previous-period denominator MUST show change as not calculable.
- **DATA-004:** A cohort outcome MUST disclose its eligible cohort, horizon and loss to follow-up.
- **DATA-005:** A total MUST reconcile with published subgroups within documented rounding and suppression rules.
- **VIS-002:** Every KPI card MUST show value/unit, comparison, target status, period, refresh time, confidence, source and definition link.
- **VIS-003:** No target or colour band may be embedded only in UI code; it must be approved, versioned metadata.

## 7. Indicator Registry

- **DATA-010:** No KPI may be publishable without a stable code, BM/English name, purpose, evidence status, numerator, denominator, formula, unit, direction, dimensions, cadence, freshness expectation, source, owner, quality rules, target status, suppression rule, interpretation and definition version.
- **DATA-011:** Indicator definition changes MUST be effective-dated and MUST NOT rewrite historical publications.
- **DATA-012:** Confidence MUST be shown separately from threat/risk and should account for completeness, timeliness, validity, geographic coverage, denominator quality and publication state.
- **DATA-013:** Any confidence formula and weights MUST be visible and versioned.

## 8. National Multi-Layer Threat Map

### 8.1 Layers

- **MAP-001:** The map MUST provide separate selectable layers for drug burden/demand, supply/enforcement threat, harm, service gap and data confidence.
- **MAP-002:** A National Drug Threat Score MAY be implemented as disabled/experimental scaffolding, but MUST NOT be presented as official until approved.
- **MAP-003:** Service capacity MAY influence a service-gap layer but MUST NOT erase or conceal actual burden.

### 8.2 Classification and calculation

- **MAP-010:** Red/yellow/orange/green classification MUST use approved, effective-dated rules.
- **MAP-011:** If rules are unapproved, V1 MUST label the layer as demo and provide an explicit method explanation.
- **MAP-012:** Any composite calculation MUST expose its component observations, transformations, weights, missing-data rule and minimum coverage rule.
- **MAP-013:** Score methodology changes MUST create a new version.
- **MAP-014:** Every layer MUST retain access to raw values and rates.

### 8.3 Interaction and disclosure

- **MAP-020:** The default geography MUST be Malaysia by state.
- **MAP-021:** District polygons MUST appear only when district facts, boundaries and denominators are adequate.
- **MAP-022:** Choropleth colour MUST represent a comparable rate or approved index, not raw counts.
- **MAP-023:** Absolute workload MUST be available through a separate count representation.
- **MAP-024:** Hover/tap MUST disclose geography, value, unit, count, denominator, change, rank when comparable, period, confidence, status and refresh time.
- **MAP-025:** Selection MUST open drivers, demographic breakdown, trend, services/programmes, alerts, notes and actions where authorised.
- **MAP-026:** Users SHOULD be able to compare periods/layers and use a non-autoplay time control.
- **MAP-027:** Search, zoom-to-selection and URL-preserved state SHOULD be supported.
- **MAP-028:** Every map view MUST have an accessible ranked-table equivalent.
- **MAP-029:** Status MUST use text/icon/pattern as well as colour and a colour-blind-safe palette.
- **MAP-030:** Zero, no data, not collected, not applicable and suppressed MUST be semantically distinct.
- **MAP-031:** Exact sensitive points MUST NOT be transmitted to general clients; data must be aggregated, generalised or suppressed.
- **MAP-032:** Screen and export disclosure controls MUST be identical.

## 9. Teras 1 - Pendidikan Pencegahan

### 9.1 Purpose and responsibility

Teras 1 supports prioritisation of at-risk populations/locations and evaluation of prevention reach and effect. JPPP is explicitly associated with this Teras; AADK remains overall coordinator. Education, family, community and workplace participants are policy settings. Other agency mappings are policy-listed, functionally inferred or validation-required rather than exclusive assignments.

### 9.2 Core indicators

- **FR-T1-001 [Available/Derived]:** Show active, new and repeat record counts/rates and demographic burden where source definitions support them.
- **FR-T1-002 [Available/Derived]:** Show age, recorded sex, ethnicity, education, occupation, geography and available source status with missingness.
- **FR-T1-003 [Proposed]:** Show prevention programmes by the six DDN strategies and education/family/community/workplace settings.
- **FR-T1-004 [Proposed]:** Show eligible/targeted, registered, attended, completed, assessed and improved stages.
- **FR-T1-005 [Proposed]:** Calculate coverage, priority-area coverage, attendance, completion, dosage, timeliness, facilitator coverage and programme fidelity.
- **FR-T1-006 [Proposed]:** Show approved pre/post knowledge, attitudes/protective factors, refusal/help-seeking skills and referrals.
- **FR-T1-007 [Proposed]:** Show cost, cost per verified output/outcome, satisfaction, response rate and complaints.
- **FR-T1-008:** Repeat records MUST NOT be relabelled as relapse, and burden trends MUST NOT be presented as programme-caused outcomes.

### 9.3 Data and visuals

- **DATA-T1-001:** Required proposed datasets are programme master, activity/delivery, participant/aggregate reach, assessment, referral, cost/feedback and versioned context/denominator records.
- **VIS-T1-001:** Primary visual: burden layer with prevention programme/reach overlays.
- **VIS-T1-002:** Required supporting views: ranked need/coverage table, demographic distribution, trend, delivery funnel and geography × strategy coverage matrix.
- **VIS-T1-003:** A need-versus-coverage comparison SHOULD identify high-need/low-coverage areas.
- **ACC-T1-001:** An authorised user can identify who/where has need, inspect coverage and evidence status, and create an action without seeing an individual.

## 10. Teras 2 - Rawatan dan Pemulihan

### 10.1 Purpose and responsibility

Teras 2 follows access, treatment, aftercare, sustained outcomes and reintegration. JRP is explicitly associated with this Teras; AADK coordinates overall. Health, social, institutional/community/private providers and other participants require current ownership validation.

### 10.2 Core indicators

- **FR-T2-001 [Available]:** Show active clients and facilities by institutional PUSPEN, community-based and private rehabilitation settings.
- **FR-T2-002 [Available]:** Show mandatory/voluntary pathways, new/repeat source status and supported demographics/geographies.
- **FR-T2-003 [Proposed]:** Show capacity, occupancy, staffing, referrals, screening conversion and wait time.
- **FR-T2-004 [Proposed]:** Show initiation, 30/90/180-day retention, adherence, completion, dropout and length of stay.
- **FR-T2-005 [Proposed]:** Show aftercare enrolment and valid 3/6/12-month follow-up completion.
- **FR-T2-006 [Validation required]:** Sustained recovery and return-to-use must use separately approved definitions and expose loss to follow-up.
- **FR-T2-007 [Proposed]:** Reintegration must show employment/education, housing, family/community support and stigma/discrimination as separate domains.
- **FR-T2-008 [Validation required]:** A composite reintegration score MAY appear only with approved components and always alongside them.
- **FR-T2-009 [Proposed]:** Show physical/mental health outcomes, adverse events, equity, cost and client/family experience.
- **FR-T2-010:** Completion MUST NOT be labelled sustained recovery; repeat status MUST NOT be labelled relapse.

### 10.3 Data and visuals

- **DATA-T2-001:** Required datasets are facility/service capacity, aggregate caseload and, only if authorised, pseudonymous treatment episodes, services, discharges, aftercare and follow-ups.
- **DATA-T2-002:** Identity/token mapping MUST remain outside the analytical zone.
- **VIS-T2-001:** Primary visual: care-pathway funnel with cohort selection and loss to follow-up.
- **VIS-T2-002:** Supporting views: facility/capacity map, admissions and outcome trends, retention curve, outcome matrix, wait/occupancy distribution and reintegration domain cards.
- **ACC-T2-001:** A user can distinguish access, completion, aftercare, assessed recovery and reintegration; compare like cohorts and see missing follow-up.

## 11. Teras 3 - Penguatkuasaan

### 11.1 Purpose and responsibility

Teras 3 follows signals through operations, investigations and final legal disposition, together with supply, seizures, precursors, NPS, border, asset and coordination indicators. JPU is explicitly associated with this Teras; AADK coordinates overall. Enforcement agencies are policy-listed, while specific dataset ownership requires validation.

### 11.2 Core indicators

- **FR-T3-001 [Available/Derived]:** Show complaint count/rate/trend and source channels where available.
- **FR-T3-002 [Available/Derived]:** Show suspected-person/arrest count/rate with explicit legal-status caveat.
- **FR-T3-003 [Proposed]:** Show complaint response, intelligence conversion, operations and multi-agency participation.
- **FR-T3-004 [Proposed]:** Keep arrest, investigation, charge, prosecution disposition and conviction stages separate.
- **FR-T3-005 [Proposed]:** Show seizure events/quantities by compatible unit, substance/form and geography.
- **FR-T3-006 [Proposed]:** Show NPS, precursors, laboratories, border interceptions and assets by legal state.
- **FR-T3-007 [Proposed]:** Show case cycle times, information-request SLA, supervision compliance and capability.
- **FR-T3-008 [Validation required]:** Any supply-disruption index must be transparent, approved and displayed with components.
- **FR-T3-009:** Arrest MUST NOT be presented as guilt, conviction or community prevalence.

### 11.3 Data and visuals

- **DATA-T3-001:** Required datasets are complaint/signal, operation/case stages, seizure/laboratory, border, financial and request/SLA records.
- **DATA-T3-002:** Informant identity, raw tactics, exact operational coordinates, narratives and chain-of-custody material SHOULD remain in source systems.
- **VIS-T3-001:** Primary visual: supply/enforcement threat layer, separate from client burden.
- **VIS-T3-002:** Supporting views: legal-stage funnel, trends, substance × geography matrix, seizure count/quantity, backlog/cycle-time distribution, participation matrix and asset waterfall.
- **ACC-T3-001:** An authorised user can distinguish each legal stage, inspect supply signals and coordination, and act without exposure or guilt/prevalence implications.

## 12. Teras 4 - Pengurangan Kemudaratan

### 12.1 Purpose and responsibility

Teras 4 monitors physical, psychological, social and economic harms and the reach/outcome of protective services. It is distinct from the treatment episode focus of Teras 2. Responsibility is distributed among relevant health, social, AADK, service-provider, NGO and community participants; specific ownership is validation-required.

### 12.2 Core indicators

- **FR-T4-001 [Proposed]:** Show drug-related deaths and fatal/non-fatal overdose separately under approved definitions.
- **FR-T4-002 [Proposed]:** Show emergency/hospital presentations and approved injury indicators.
- **FR-T4-003 [Proposed]:** Show HIV/HBV/HCV/TB/STI screening, positivity, linkage, initiation and clinical outcomes as a cascade.
- **FR-T4-004 [Proposed]:** Show medication-assisted treatment, detoxification, retention, outreach, referral and follow-up.
- **FR-T4-005 [Proposed]:** Show mental-health, family/social support, approved housing/economic indicators and service barriers.
- **FR-T4-006 [Validation required]:** Naloxone and sterile-equipment indicators must appear only if officially in scope.
- **FR-T4-007 [Proposed]:** Show harm versus service capacity/coverage and identify high-harm/low-coverage areas.
- **FR-T4-008:** The page MUST NOT imply that the supplied weekly report already contains these outcome measures.

### 12.3 Data and visuals

- **DATA-T4-001:** Required datasets are harm events/aggregates, screening/test/linkage and harm-reduction service/capacity/outcome records.
- **DATA-T4-002:** Health data SHOULD be aggregated before transfer unless approved linkage is essential.
- **VIS-T4-001:** Primary visual: harm map with service coverage and service-gap overlay.
- **VIS-T4-002:** Supporting views: harm trends, screening-to-care cascade, geography × intervention matrix, harm-versus-service comparison, retention and barriers/satisfaction.
- **ACC-T4-001:** A user can separate harms from services, inspect coverage and cascades, understand uncertainty and avoid exposure of confidential health information.

## 13. Teras 5 - Kerjasama Antarabangsa

### 13.1 Purpose and responsibility

Teras 5 manages bilateral/multilateral relationships and demonstrates whether engagement produces commitments, exchange, capability, joint outputs and adopted practice. Responsibility is distributed among AADK, international-affairs and relevant agency participants. Partner ownership must be validated.

### 13.2 Core indicators

- **FR-T5-001 [Proposed]:** Show active partners and agreements/MOUs by lifecycle state.
- **FR-T5-002 [Proposed]:** Show engagements, participation and strategic-topic coverage.
- **FR-T5-003 [Proposed]:** Show commitments with owner, due date, status, age and verified closure.
- **FR-T5-004 [Proposed]:** Show training/attachments, completion, competency improvement and practice transfer.
- **FR-T5-005 [Proposed]:** Show information requests, fulfilment and response time without exposing protected content.
- **FR-T5-006 [Proposed]:** Show joint initiatives and verified outputs without combining incompatible outcomes.
- **FR-T5-007 [Proposed]:** Show best practices through identified, assessed, piloted, adopted, scaled or rejected stages.
- **FR-T5-008 [Proposed]:** Show cost, partner satisfaction and international reporting timeliness.
- **FR-T5-009:** Activity counts alone MUST NOT be described as international impact.

### 13.3 Data and visuals

- **DATA-T5-001:** Required datasets are partner/instrument master, engagement/commitment, training/attachment, information-request, knowledge/practice and joint-initiative records.
- **DATA-T5-002:** Metadata visibility MUST NOT imply access to classified, diplomatic or operational documents.
- **VIS-T5-001:** Primary visual: active partner world/ASEAN map.
- **VIS-T5-002:** Supporting views: partner × theme matrix, agreement timeline, engagement-to-outcome funnel, action tracker, SLA trends, training pipeline and practice-stage board.
- **ACC-T5-001:** A user can see relationship status, expiring/overdue obligations and evidence behind claimed outcomes without protected-content disclosure.

## 14. Data Architecture and Contracts

- **DATA-020:** The platform MUST separate approved aggregate analytical data from restricted pseudonymous events/episodes.
- **DATA-021:** It MUST use conformed, effective-dated dimensions rather than one wide mega-table.
- **DATA-022:** Core dimensions MUST cover organisation, geography/boundary version, time, approved population groups, substance, programme, facility/service, indicator and international partner/forum.
- **DATA-023:** Observed facts MUST remain separate from targets, derived indicators, annotations and workflow status.
- **DATA-024:** Every ingested record MUST inherit source system/record, organisation/steward, period, geography/boundary, schema/definition version, workflow state, classification, lineage, revision and quality metadata.
- **DATA-025:** Source records and transformation versions MUST permit reproduction of every published value.
- **DATA-026:** Timestamps MUST be stored in UTC and displayed appropriately for Malaysia; values must preserve units.
- **DATA-027:** Each field must support an approved decision, KPI, quality rule or legal obligation.

### 14.1 Upload contracts

- **DATA-030:** V1 SHOULD provide separate versioned templates for aggregate indicators, prevention, treatment, enforcement, harm, international activity, facility capacity and population denominators.
- **DATA-031:** Every template MUST include instructions/data dictionary, controlled values, schema version, owner and safe example rows.
- **DATA-032:** Incompatible major schema versions MUST be rejected with a migration path.
- **DATA-033:** Formula cells, macros and executable content MUST NOT be trusted as data.

### 14.2 Quality and lineage

- **DATA-040:** Validation MUST cover structure, types, codes, units, ranges, relationships, reconciliation, chronology, duplicates, anomalies, missing submissions and comparison coverage.
- **DATA-041:** Integrity/security errors MUST block submission; eligible warnings require written justification and approval.
- **DATA-042:** Errors MUST be actionable at row/column level with downloadable results and revalidation.
- **DATA-043:** Ingestion MUST be idempotent by checksum and source keys.
- **DATA-044:** Cross-agency person linkage MUST NOT occur without formal authority, privacy/security assessment and an approved reversible method.
- **DATA-045:** Publications MUST be append-only/versioned and traceable from submission through transformation to indicator and visual/export.
- **DATA-046:** Official publication MUST use independent approval, revision reason and reproducible “as published” versions.

## 15. Submission and Collaboration Workflow

- **WF-001:** User selects a template/domain and period and sees owner, deadline, classification and versions.
- **WF-002:** Upload MUST use a short-lived authorised target and private storage.
- **WF-003:** Files MUST be quarantined and scanned before isolated asynchronous parsing.
- **WF-004:** Schema/business validation MUST produce errors, warnings and a data preview.
- **WF-005:** A steward MUST attest source, coverage and quality before submission.
- **WF-006:** An independent reviewer MUST approve/reject with a comment.
- **WF-007:** Publication MUST atomically promote one approved version and refresh affected aggregates/maps.
- **WF-008:** Revision MUST preserve the previous publication and record impact/reason.
- **WF-009:** Comments MUST attach to an authorised KPI, geography, programme, submission or saved view and inherit its classification.
- **WF-010:** Actions MUST support owner, organisation, priority, due date, status, evidence and verified closure.
- **WF-011:** Comments MUST NOT override source data; corrections use the revision workflow.
- **WF-012:** Notifications MUST omit sensitive row data and become inaccessible if permission is revoked.

## 16. Technical Architecture

- **NFR-001:** The target is a pinned, tested Next.js 16.x App Router application using strict TypeScript.
- **NFR-002:** React Server Components SHOULD handle authenticated reads; Client Components SHOULD be limited to necessary interaction.
- **NFR-003:** Server Components SHOULD call a server-only Data Access Layer rather than the application’s own HTTP endpoints.
- **NFR-004:** Route Handlers MUST serve browser-facing APIs, uploads, exports, webhooks and approved integrations.
- **NFR-005:** Every Server Action and Route Handler MUST authenticate, authorise, validate and audit mutations.
- **NFR-006:** PostgreSQL/PostGIS is the proposed authoritative relational/geospatial store.
- **NFR-007:** Raw uploads and generated exports SHOULD use encrypted private object storage.
- **NFR-008:** Malware scanning, parsing, validation, aggregation, map preparation and large exports MUST run outside long-lived Next.js requests.
- **NFR-009:** APIs SHOULD be versioned and documented, use strict schemas, bounded queries, pagination, idempotency and optimistic concurrency.
- **NFR-010:** Sensitive/user-specific responses MUST NOT enter public/shared caches.
- **NFR-011:** The data layer MUST return minimal typed DTOs and apply scope/suppression before returning results.
- **NFR-012:** Geospatial clients MUST receive only approved aggregate features/tiles, never full event datasets.

## 17. Security, Privacy and Legal Controls

- **SEC-010:** Every dataset, field, file, visual, comment and export MUST have classification, purpose, owner, permitted roles, retention and disclosure rules.
- **SEC-011:** The system MUST prefer aggregate data and minimise person/health/enforcement fields.
- **SEC-012:** Lower environments MUST contain synthetic or irreversibly anonymised data only.
- **SEC-013:** Screens, APIs and exports MUST apply small-number and secondary suppression.
- **SEC-014:** Secrets MUST remain outside source, client bundles, logs and templates.
- **SEC-015:** Database access MUST be parameterised; untrusted HTML and user-controlled query fragments are prohibited.
- **SEC-016:** File upload MUST validate extension/signature/size, block macros/executable/formula payloads and parser bombs, scan in quarantine and parse with least privilege and resource limits.
- **SEC-017:** Audit MUST cover authentication, access changes, sensitive views/exports, uploads, validation overrides, approvals/publications, indicator/target changes and administrative actions.
- **SEC-018:** Audit records MUST avoid raw sensitive payloads and contain actor, action, object, time, result, reason and correlation ID.
- **SEC-019:** Production release requires the agreed privacy, data-sharing, cyber-security, records-management and penetration-test reviews.

## 18. Accessibility, Performance and Operations

- **NFR-020:** Critical V1 workflows and exports MUST target WCAG 2.2 AA.
- **NFR-021:** Keyboard navigation, visible focus, readable order, accessible chart summaries and equivalent data tables are required.
- **NFR-022:** Essential workflows MUST reflow at 320 CSS pixels; map/dashboard layouts may stack responsively.
- **NFR-023:** Motion must respect user preference and map animation must be off by default.
- **NFR-024:** BM is the baseline; all strings, dates, numbers and units must support controlled localisation.
- **NFR-025:** Target p75 Core Web Vitals are LCP <= 2.5 s, INP <= 200 ms and CLS <= 0.1 on representative conditions.
- **NFR-026:** Normal cached filters SHOULD respond within 2 seconds; complex comparisons within 5 seconds; initial map layer within 4 seconds, subject to client validation.
- **NFR-027:** Tables and last approved data SHOULD remain usable if maps or feeds fail.
- **NFR-028:** Jobs MUST be idempotent, retry safely and support dead-letter diagnosis.
- **NFR-029:** Observability MUST cover request/query/job latency, errors, queue health, map delivery, integrations, authentication anomalies, data freshness, validation and reconciliation without logging sensitive content.

## 19. Exports and Analytical Safeguards

- **FR-050:** Approved aggregate tables SHOULD export to CSV/XLSX and visuals to supported image/PDF formats.
- **FR-051:** Exports MUST include title, filters, period, publication version, generation context, classification and caveats.
- **FR-052:** Export permission and disclosure MUST be re-evaluated at generation/download time.
- **FR-053:** Large exports MUST be asynchronous, time-limited and audited.
- **FR-054:** CSV/XLSX output MUST prevent spreadsheet formula injection.
- **FR-055:** Saved views/reports MUST retain definition and publication versions.
- **FR-056:** Statistical comparisons MUST disclose definition, coverage, boundaries, sample/cohort and exclusions.
- **FR-057:** Any AI-generated narrative must cite approved metrics, remain draft and require human review.

## 20. Required Testing

- **ACC-001:** Unit tests cover KPI formulae, count/rate semantics, period change, confidence, thresholds and suppression.
- **ACC-002:** Contract tests cover templates and APIs.
- **ACC-003:** Database tests cover constraints, spatial joins, aggregation and organisation/geography isolation.
- **ACC-004:** End-to-end tests cover upload -> validate -> attest -> approve -> publish -> view/export -> revise.
- **ACC-005:** Negative security tests prove cross-organisation and cross-role isolation and prohibit self-approval.
- **ACC-006:** Accessibility testing includes automated checks plus keyboard, screen-reader, zoom/reflow and colour-independent manual review.
- **ACC-007:** Visual/responsive testing covers map boundaries/labels, data states, BM localisation and print/export.
- **ACC-008:** Real supplied values used by V1 reconcile to the source report.
- **ACC-009:** Golden fixtures cover null/zero denominators, missing groups, suppression, late/revised records, definition/boundary mismatch, loss to follow-up and duplicates.
- **ACC-010:** Production build, lint and strict type checks pass.

## 21. V1 Definition of Done

V1 is complete only when:

- **ACC-020:** The overview and five Teras pages meet their page acceptance criteria.
- **ACC-021:** The threat map keeps burden, supply, harm, service gap and confidence distinct.
- **ACC-022:** No unapproved official zone thresholds or composite weights are presented.
- **ACC-023:** Supported real indicators reconcile to the weekly report.
- **ACC-024:** Unsupported scenarios are unmistakably `DEMO / SYNTHETIC` across screen and export.
- **ACC-025:** Every displayed KPI exposes definition, source, owner status, period, freshness, confidence and version.
- **ACC-026:** Upload, validation, independent approval, publication and revision work as a traceable loop.
- **ACC-027:** Permission, disclosure, audit and self-approval controls pass.
- **ACC-028:** A non-technical user can identify a priority area, its driver, its confidence and an accountable next action.
- **ACC-029:** Required tests and production build pass.
- **ACC-030:** Open governance, legal and deployment decisions remain visibly unresolved rather than silently assumed.

## 22. Deferred Beyond V1

- Person-level cross-agency linkage.
- Automated MyGDX or source-system integrations.
- Validated forecasting, anomaly detection or predictive analytics.
- Public/open-data release.
- Native mobile application.
- Generative narrative over sensitive data.
- Live operational intelligence mapping.
- District/locality rollout without complete denominators, boundaries and disclosure rules.

## 23. Client Decisions Required Before Production Baseline

1. Current governance hierarchy and accountable owner for each Teras/dataset.
2. V1 participating organisations and approval authorities.
3. Definitions of active, new, repeat, completion, recovery, return to use and reintegration.
4. Comparable treatment modalities, legal stages and harm-reduction services.
5. Population source, boundary version and lowest authorised geography.
6. Threat-layer indicators, weights, classification thresholds and minimum-data rule.
7. Small-number, rate-stability and export-disclosure rules.
8. Aggregate versus pseudonymous source data and authorised linkage.
9. Hosting, identity, residency, network and approved platform services.
10. Availability, support, RTO/RPO, devices, browsers and operational ownership.

Codex must record these as blockers or demo assumptions in `PLANS.md`; it must not manufacture answers.
