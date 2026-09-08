# Source and Traceability Guide

## 1. Purpose

This file defines how Codex must use project sources and how implementation work must trace back to the approved contract.

Sources have different authority. A policy statement, a value in a weekly report, a proposed dashboard feature and a behavioural instruction are not interchangeable.

## 2. Source Classes

| Class | Meaning |
|---|---|
| Behavioural | Controls how Codex works in the repository. |
| Normative product | Defines the approved V1 requirement. |
| Domain policy | Defines policy intent, terminology, responsibilities or evaluation expectations. |
| Evidentiary data | Supports specific observed values and dimensions. |
| Discovery | Contains researched proposals, alternatives and unresolved requirements. |
| Human orientation | Explains the project without overriding the contract. |

## 3. Source Register

### 3.1 `AGENTS.md`

**Class:** Behavioural  
**Authority:** Highest for Codex conduct, edit boundaries, source interpretation, validation and stop conditions.

Codex must use it to determine:

- required reading order;
- what may be changed;
- when `PLANS.md` must be created and updated;
- evidence and synthetic-data rules;
- privacy/security boundaries;
- validation and reporting requirements; and
- when to stop rather than guess.

It does not define domain facts independently of the source documents.

### 3.2 `PROJECT_CONTEXT.md`

**Class:** Project meaning and approved intent  
**Authority:** Normative for why the product exists, current phase, users, source limitations and stakeholder distinctions.

Codex may use it to understand:

- the collaboration problem;
- the five-page policy structure;
- the V1 demonstration objective;
- real versus synthetic data boundaries;
- AADK/committee responsibility distinctions;
- the threat-map concept; and
- known risks and client decisions.

It must not be treated as a substitute for detailed requirement acceptance criteria in `SPEC.md`.

### 3.3 `SPEC.md`

**Class:** Normative product contract  
**Authority:** Authoritative for what V1 must, should and may implement.

Codex must:

- plan and report against stable requirement IDs;
- trace milestones, tests and changes to these IDs;
- propose rather than silently make material requirement changes; and
- preserve explicit out-of-scope boundaries.

If repository reality makes a requirement infeasible, record the mismatch and seek a decision. Do not downgrade the requirement silently.

### 3.4 `requirements.md`

**Class:** Discovery  
**Authority:** Detailed supporting analysis, not automatically an approved production contract.

It contains:

- extensive KPI catalogues;
- proposed data fields and upload templates;
- visual and threat-map alternatives;
- collaboration, access, security and architecture detail;
- testing and operational recommendations;
- risks and client questions; and
- researched external references.

Codex may use it to clarify the intention behind `SPEC.md` or prepare a proposed amendment. It must not implement every brainstormed item merely because it appears there. `SPEC.md` determines the V1 obligation.

### 3.5 `project_sources/02-Dasar-Dadah-Negara-BM_compressed.pdf`

**Display title:** *Dasar Dadah Negara 2017*  
**Class:** Domain policy  
**Authority:** Primary supplied source for the five Teras, policy strategies, target groups, listed participants and the evaluation framework.

Codex may learn from it:

- the meaning and scope of each Teras;
- the six prevention strategies and the education, family, community and workplace settings;
- treatment and rehabilitation principles, settings and target groups;
- enforcement aims, strategies and target groups;
- physical, psychological, social and economic harm-reduction framing;
- bilateral and multilateral cooperation activities and target groups;
- evaluation through needs, process, outcomes, cost and client satisfaction;
- AADK's overall lead/coordinator role; and
- policy-listed ministries, departments, agencies and committees.

Codex must not infer from it:

- that a particular KPI is currently collected;
- that a 2017 organisation name or committee structure is current in 2026;
- an exclusive one-to-one assignment of every agency to one Teras;
- approved dashboard threat thresholds or composite weights;
- current user permissions, data-sharing authority or legal clearance; or
- measured programme success.

Responsibility statements must be labelled `explicitly assigned`, `policy-listed`, `functionally inferred` or `requires stakeholder validation`.

### 3.6 `project_sources/01-Data_STATISTIK-MINGGUAN-AADK-LAPORAN-9-OGOS-2026.pdf`

**Display title:** *Statistik Mingguan AADK - Laporan 9 Ogos 2026*  
**Class:** Evidentiary operational-data snapshot  
**Authority:** Primary supplied evidence for figures and fields visible in this weekly report.

Codex may use it for:

- aggregate AADK caseload;
- mandatory/voluntary pathway counts;
- institutional PUSPEN, community-based and private rehabilitation counts;
- facilities and selected capacity/occupancy context where legible and validated;
- sex, age, ethnicity, education and occupation profiles;
- new/repeat source status;
- state-level distributions;
- complaint totals, weekly complaints and complaint channels;
- PSPD/detainee operational statistics; and
- persons suspected/arrested using the source's careful terminology.

Known headline values in the supplied snapshot include:

| Measure | Source value |
|---|---:|
| Total AADK clients | 47,084 |
| Mandatory clients | 44,906 |
| Voluntary clients | 2,178 |
| Institutional/PUSPEN clients | 5,260 |
| PUSPEN facilities | 30 |
| Community-based clients | 41,824 |
| Community districts | 108 |
| Private rehabilitation clients | 1,391 |
| Private rehabilitation centres | 47 |
| Cumulative complaints | 5,208 |
| Weekly complaints | 172 |
| Detainees/OKT | 303 |
| Detention/remand centres | 18 |
| Suspected-person arrests | 24,947 |

Any implementation value must be reconciled against the visual source; OCR text alone is not authoritative where a label or number is unclear.

Codex must not infer from this report:

- relapse from repeat status;
- recovery from discharge or completion;
- sustained recovery or aftercare success;
- employment, housing, family or social reintegration;
- social acceptance or stigma reduction;
- prevention-programme reach or effectiveness;
- complete overdose/infectious-disease/harm-service outcomes;
- complaint-to-conviction or seizure outcomes not displayed;
- international-cooperation outcomes;
- prevalence or guilt from arrest figures; or
- district conclusions where district-level facts and denominators are absent.

### 3.7 `project_sources/03-General_SDD_ChatGPT_Codex_Workflow_Guide.md`

**Display title:** *General Spec-Driven Development Workflow with ChatGPT + Codex*  
**Class:** Workflow guidance  
**Authority:** Source for the division between human, ChatGPT and Codex responsibilities.

It establishes that:

- ChatGPT designs the contract;
- Codex implements inside the repository;
- objective validation proves the build;
- the human decides acceptance;
- `AGENTS.md` controls behaviour;
- `PROJECT_CONTEXT.md` explains meaning;
- `SPEC.md` defines the build contract; and
- `PLANS.md` defines and tracks implementation.

For this project, the agreed stricter workflow reserves initial creation of `PLANS.md` for Codex after repository inspection.

### 3.8 `README.md`

**Class:** Human orientation  
**Authority:** Informational.

README instructions must remain consistent with the contract but do not override `AGENTS.md`, `PROJECT_CONTEXT.md` or `SPEC.md`. Setup commands remain pending until Codex inspects or creates an implementation.

## 4. Confirmed Responsibility Trace

| Responsibility | Status | Source basis |
|---|---|---|
| AADK lead/coordinator across the policy | Explicitly assigned | DDN 2017, functions and implementing-agencies section. |
| JPPP associated with Teras 1 | Explicitly assigned | DDN 2017 evaluation/coordination bodies. |
| JRP associated with Teras 2 | Explicitly assigned | DDN 2017 evaluation/coordination bodies. |
| JPU associated with Teras 3 | Explicitly assigned | DDN 2017 evaluation/coordination bodies. |
| JKMD national oversight | Explicitly assigned/general governance | DDN 2017 evaluation and monitoring. |
| MTMD state/district coordination | Explicitly assigned/general governance | DDN 2017 evaluation and monitoring. |
| Specific Teras 4 agency owner | Requires stakeholder validation | Distributed functions; no exclusive mapping in supplied policy. |
| Specific Teras 5 agency owner | Requires stakeholder validation | Distributed functions; no exclusive mapping in supplied policy. |
| Exact current 2026 hierarchy | Requires stakeholder validation | Must be checked against applicable 2024 machinery. |

## 5. Requirement-to-Source Traceability

Codex must use the following convention in `PLANS.md`, ADRs and implementation reports:

```text
Requirement: SPEC.md#<requirement-id>
Intent: PROJECT_CONTEXT.md#<section>
Primary evidence: <source filename, printed page/section/table>
Discovery detail: requirements.md#<section>
Implementation: <file/module>
Validation: <test/check/output>
Evidence status: Policy | Available | Derived | Proposed | Validation required
```

For multiple requirements, a compact matrix is preferred:

| Requirement ID | Source/evidence | Implementation | Validation | Status |
|---|---|---|---|---|
| `MAP-022` | Statistical/map safeguards in `requirements.md`; approved map method | To be identified in `PLANS.md` | Choropleth metric test and visual review | Planned |

## 6. Citation and Evidence Rules

- Reference repository files by their exact relative path.
- For policy claims, cite the printed page/section where practical.
- For supplied weekly values, cite the report page and displayed label.
- Do not cite OCR output as the source; it is only an extraction aid.
- A source citation proves only the claim it directly supports.
- If a visual or number is illegible, mark it unresolved and inspect the PDF page rather than guessing.
- New external sources require an entry in this register or a linked ADR/reference note before they change the contract.

## 7. Conflict Resolution

Use the instruction priority in `AGENTS.md`.

Examples:

- If `requirements.md` proposes a feature absent from `SPEC.md`, treat it as optional discovery, not mandatory V1 work.
- If the weekly report lacks a field required by `SPEC.md`, use synthetic/demo data only where allowed and record the gap.
- If the 2017 policy names a legacy body, keep the historical statement but do not hard-code it as the current owner.
- If the repository uses a materially different architecture, stop and propose a contract/ADR decision instead of rewriting the application unilaterally.
