# Codex Repository Instructions

## 1. Purpose

This file is the repository-level constitution for Codex working on the **National Drug Policy Collaborative Dashboard**.

Codex must treat the repository as a specification-driven project. It must not infer product scope from source code alone, improvise unsupported policy claims, or treat a visually complete dashboard as evidence that the requirements have been satisfied.

The operating model is:

```text
Human decisions
-> ChatGPT-authored project contract
-> Codex repository inspection
-> Codex-authored PLANS.md
-> bounded implementation milestones
-> objective validation
-> human acceptance or rejection
```

## 2. Required Reading Order

Before planning or editing implementation files, read in this order:

1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `SPEC.md`
4. `REFERENCES.md`
5. `requirements.md`
6. `README.md`
7. Existing configuration, source code, database files and tests

If a listed file does not exist, report it during inspection. Do not invent its contents.

## 3. Instruction Priority

When instructions conflict, use this priority:

1. `AGENTS.md` for behaviour, safety, edit boundaries and validation
2. `PROJECT_CONTEXT.md` for project meaning and approved intent
3. `SPEC.md` for the V1 build contract and acceptance criteria
4. Codex-generated `PLANS.md` for execution order
5. `REFERENCES.md` for source use and traceability
6. `requirements.md` for detailed discovery material
7. `README.md` for human orientation
8. Existing implementation patterns

Do not resolve a material conflict silently. Record it in `PLANS.md` and stop for a human decision when it changes scope, policy meaning, data interpretation, privacy, security or acceptance criteria.

## 4. First Codex Pass

The first pass must be repository inspection and planning, not broad implementation.

Codex must:

1. Inspect the complete repository structure.
2. Identify the existing framework, package manager, dependencies, routes, database state, tests and deployment configuration.
3. Compare repository reality with `SPEC.md`.
4. Identify missing prerequisites, contradictions, risks and decisions.
5. Create `PLANS.md` with bounded milestones, validation commands, progress states and stop conditions.
6. Create `TASKS.md` only if the project becomes too complex to track clearly in `PLANS.md`.
7. Stop and report after planning unless the user explicitly authorises implementation in the same run.

Codex may recommend amendments to `SPEC.md`, but must not weaken or expand the approved scope without clearly reporting the proposed change.

## 5. Planning and Milestone Discipline

- Implement one bounded milestone from `PLANS.md` at a time.
- Mark the active milestone before editing.
- Run the smallest relevant validation during development and the complete milestone validation before marking it complete.
- Update the `PLANS.md` progress log after every milestone.
- Record decisions, assumptions, blockers, commands and outputs in `PLANS.md`.
- Do not mark a requirement complete merely because UI or code exists. Its acceptance checks must pass.
- Do not conceal unfinished functionality behind static values or successful empty states.

## 6. File Ownership and Edit Boundaries

### 6.1 Read-only source and contract inputs

Do not modify, replace, rename or delete these files unless the user explicitly requests a contract revision:

- `project_sources/01-Data_STATISTIK-MINGGUAN-AADK-LAPORAN-9-OGOS-2026.pdf`
- `project_sources/02-Dasar-Dadah-Negara-BM_compressed.pdf`
- `project_sources/03-General_SDD_ChatGPT_Codex_Workflow_Guide.md`
- `requirements.md`
- `PROJECT_CONTEXT.md`
- `REFERENCES.md`

`SPEC.md` may be amended only when repository inspection reveals a necessary clarification or the human approves a requirement change. Record the reason and affected requirement IDs.

### 6.2 Codex-owned files

Codex is expected to create and maintain:

- `PLANS.md`
- optional `TASKS.md`
- application source code
- database schemas and migrations
- tests and fixtures
- scripts and configuration
- technical documentation and architecture decision records
- runtime-safe synthetic/demo data
- implementation and validation reports

Do not create overlapping instruction files that restate the contract.

### 6.3 Existing work

Preserve user changes and unrelated repository content. Do not overwrite an existing application structure or configuration merely to match a preferred template. Adapt the implementation plan to repository reality.

## 7. Product Scope Guardrails

Version 1.0 is a **governed collaborative dashboard prototype and stakeholder-validation baseline**, not a complete national production system.

V1 must demonstrate:

- an executive overview;
- one page for each of the five Teras;
- a transparent Malaysia threat-map experience;
- common filters and decision-oriented visuals;
- controlled data submission, validation, approval and publication;
- source, definition, freshness, confidence and ownership metadata;
- collaboration through notes, decisions and accountable actions; and
- a clear separation between supplied real data, derived data and synthetic demonstration data.

V1 is not:

- a person-level case-management system;
- a replacement for agency operational systems;
- a live policing or intelligence system;
- an automated individual risk or suspicion engine;
- a public portal containing sensitive data; or
- proof that a programme caused an observed change.

Do not add unrelated features, predictive policing, facial recognition, social-media surveillance, person-level public mapping or free-form AI access to sensitive data.

## 8. Policy and Responsibility Rules

Preserve these source distinctions:

- **AADK** is identified by the 2017 policy as the principal lead and coordinator across all five Teras.
- **JPPP** is explicitly associated with Teras 1, Pendidikan Pencegahan.
- **JRP** is explicitly associated with Teras 2, Rawatan dan Pemulihan.
- **JPU** is explicitly associated with Teras 3, Penguatkuasaan.
- **JKMD** provides national oversight.
- **MTMD** coordinates at state and district levels.
- Teras 4 and Teras 5 have distributed responsibility among relevant health, social, enforcement and international-affairs participants.

The 2017 policy lists nine ministries, fifteen principal agencies/departments, NGOs, private/corporate bodies and communities, but it does not give an exclusive one-to-one agency-to-Teras responsibility table.

Every responsibility statement must be classified as one of:

- `explicitly assigned`;
- `policy-listed`;
- `functionally inferred`; or
- `requires stakeholder validation`.

Never present a functionally inferred assignment as confirmed policy. Do not hard-code legacy organisation names. Use effective-dated organisation master data and keep the current committee hierarchy subject to validation against the applicable 2024 coordination machinery.

## 9. Evidence and Data Semantics

Use these evidence labels consistently:

| Label | Meaning |
|---|---|
| `Policy` | Explicitly required or clearly implied by the 2017 DDN. |
| `Available` | Can be populated at least partly from the supplied weekly AADK report. |
| `Derived` | Calculated from available fields plus an approved formula or denominator. |
| `Proposed` | Requires a new field, feed, survey or workflow. |
| `Validation required` | Definition, owner, target, governance or applicability is unresolved. |

Mandatory semantic safeguards:

- A repeat client/record is not automatically a relapse.
- Treatment completion is not sustained recovery.
- An arrest is not proof of guilt and is not a prevalence estimate.
- A complaint is a signal, not a confirmed offence.
- Administrative data does not directly measure social acceptance.
- Counts, records, episodes, events, contacts and unique people are not interchangeable.
- Zero, unknown, not collected, not applicable and suppressed are distinct states.
- Correlation and coincident trends do not prove programme impact.

## 10. Real, Derived and Synthetic Data

- The supplied weekly report is the real V1 seed source, primarily for Teras 2 and selected Teras 3 indicators.
- Demographic and geographic client statistics may provide cautious context for Teras 1, but do not measure prevention programme performance.
- Teras 4 and Teras 5 have almost no direct coverage in the supplied weekly report.
- Any unsupported V1 scenario must use generated synthetic data, never invented data presented as official.
- Every synthetic card, table, chart, map tooltip, export and report must display `DEMO / SYNTHETIC`.
- Synthetic datasets must be structurally separate from official datasets and must not be publishable as official.
- Do not use real personal data in development, tests, demos or fixtures.

## 11. Threat-Map Rules

The strategic visual is a Malaysia map with state-level status and conditional district drill-down.

Codex must ensure:

- raw counts and population-adjusted rates are both available;
- choropleth colour represents a comparable rate or approved index, not raw workload;
- absolute workload is shown separately, such as through proportional symbols or a count layer;
- burden/demand, supply/enforcement threat, harm, service gap and data confidence remain separate selectable layers;
- an overall composite is optional and disabled until its components, weights, missing-data rules and thresholds are approved;
- every zone exposes its value, denominator, period, trend, confidence, source and component drivers;
- red/yellow/orange/green thresholds are not invented;
- no-data, suppressed, not-applicable and zero states are visually distinct;
- colour is never the only status signal;
- map views have an accessible ranked-table equivalent;
- district polygons appear only where district data and denominators are valid;
- sensitive precise locations and small cells are aggregated, generalised or suppressed; and
- exports apply the same disclosure controls as on-screen views.

## 12. Privacy, Security and Access

- Prefer aggregate data. Use pseudonymous episode/event data only where approved and necessary.
- Keep identity and token-mapping systems outside the analytical zone.
- Enforce authorisation server-side using role, organisation, geography, dataset/Teras, sensitivity and workflow state.
- Viewing, uploading, approving, publishing and exporting are separate permissions.
- A submitter must not approve their own submission.
- Apply least privilege, default deny and segregation of duties.
- Never leak restricted values through HTML, React Server Component payloads, client logs, application logs, cache keys, errors, search, counts or exports.
- Apply small-number and secondary suppression consistently.
- Quarantine and validate uploads before parsing or publication.
- Do not log file rows, personal identifiers, secrets, tokens or sensitive free text.
- Treat the legal and security items in `SPEC.md` as requirements requiring client/legal confirmation, not legal advice from Codex.

## 13. Engineering Rules

- Target the approved Next.js 16.x App Router and TypeScript architecture in `SPEC.md`, but pin exact versions only after inspection and compatibility checks.
- Use strict TypeScript.
- Prefer React Server Components for authenticated reads and Client Components only for interactive maps, charts, filters and upload controls.
- Keep privileged clients and secrets in server-only modules.
- Centralise authentication, authorisation, data scope and disclosure logic in a typed Data Access Layer.
- Return deliberately shaped DTOs; never serialize database models wholesale to clients.
- Use parameterised database access.
- Use PostgreSQL/PostGIS for relational and geospatial requirements unless inspection reveals an approved alternative requiring human decision.
- Heavy upload parsing, malware scanning, aggregation, report generation and tile generation must use isolated asynchronous workers, not long-running Next.js requests.
- Prefer small, traceable changes over premature abstractions.
- Do not add a dependency when platform capability or an existing dependency is adequate.
- Record consequential architecture choices in ADRs.

## 14. Required Validation

Codex must identify exact commands from the actual repository and put them in `PLANS.md`. At minimum, validation must cover:

- formatting and linting;
- strict type checking;
- unit tests for KPI formulae, rates, period changes, confidence, zoning and suppression;
- schema and upload-contract tests;
- database constraints, spatial joins and organisation/geography isolation;
- negative authorisation tests;
- end-to-end upload -> validate -> approve -> publish -> view -> revise flow;
- route and role smoke tests;
- accessibility checks and keyboard/table alternatives;
- responsive and visual checks;
- production build;
- reconciliation of supplied real values to the source snapshot; and
- clear synthetic-data labelling.

The definition of done is not “code exists.” It is that the approved requirement behaves correctly, relevant tests pass, outputs reconcile, and the implementation matches the acceptance criteria.

## 15. Stop Conditions

Stop and report instead of guessing when:

- the requested change conflicts with `SPEC.md`;
- a required source, data field, denominator, boundary or configuration is missing;
- a KPI definition, recovery concept, legal stage, responsibility owner or map threshold is unresolved;
- implementation requires real credentials, sensitive production data or external authority not provided;
- a privacy, security, legal or classification decision is required;
- current repository reality would require a material architecture or scope change;
- tests cannot be run or their expected behaviour is unknown;
- a destructive migration or irreversible operation is required without explicit authorisation; or
- an inferred agency assignment would be presented as authoritative.

## 16. Final Report Standard

Every Codex implementation run must report:

1. Milestone attempted and status.
2. Files created, changed or deleted.
3. Commands executed.
4. Tests and checks passed or failed.
5. Outputs generated.
6. Requirement IDs satisfied.
7. Data used and its evidence status.
8. Assumptions and limitations.
9. Blocked or deferred items.
10. `PLANS.md` updates and the next recommended milestone.

If a run fails, also report where it failed, why, what was attempted and what remains unchanged.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
