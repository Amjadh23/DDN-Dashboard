# Project Context

## 1. Project Identity

**Working title:** National Drug Policy Collaborative Dashboard  
**Domain:** National drug-policy monitoring and inter-agency collaboration  
**Current phase:** Version 1.0 discovery prototype and stakeholder-presentation baseline  
**Primary implementation direction:** Next.js App Router, TypeScript and a geospatially capable relational data layer

## 2. Background

The project was commissioned from a high-level client vision rather than a complete technical brief. The client wants organisations involved in Malaysia's drug-policy response to stop analysing and reporting data in isolation.

Today, relevant ministries, departments, enforcement bodies, health and rehabilitation providers, NGOs, private organisations and community participants may hold different parts of the national picture. The intended platform gives approved participants one governed environment in which they can:

- submit data using consistent contracts;
- validate and approve it before publication;
- analyse the same approved figures;
- compare need, activity and outcomes across geography and time;
- discuss findings and record decisions;
- assign accountable follow-up actions; and
- produce traceable reports.

The product is therefore not merely a statistics dashboard. It is a **collaborative national policy-monitoring and decision-support workspace**.

## 3. Policy Foundation

The product is organised around the five Teras in Malaysia's *Dasar Dadah Negara 2017*:

| Teras | Name | Core decision supported by the page |
|---|---|---|
| 1 | Pendidikan Pencegahan | Where and among whom is risk increasing, and are prevention programmes reaching the right groups effectively? |
| 2 | Rawatan dan Pemulihan | Are people accessing, remaining in and benefiting from treatment, and are recovery and reintegration sustained? |
| 3 | Penguatkuasaan | Where is supply-related threat concentrated, and how effective, timely and coordinated is the response? |
| 4 | Pengurangan Kemudaratan | What physical, psychological, social and economic harms are occurring, and are protective services reducing them? |
| 5 | Kerjasama Antarabangsa | Are international relationships, exchanges and commitments producing useful domestic actions and outcomes? |

The policy also establishes a common evaluation frame. Each Teras should support analysis of:

1. needs;
2. process;
3. outcomes;
4. cost; and
5. client or participant satisfaction.

Monitoring must be meaningful at national, state and district levels where valid data exists.

## 4. Stakeholders and Responsibility

### 4.1 Confirmed policy position

- AADK is the principal lead and coordinator across the five Teras.
- JPPP is explicitly associated with Teras 1, Pendidikan Pencegahan.
- JRP is explicitly associated with Teras 2, Rawatan dan Pemulihan.
- JPU is explicitly associated with Teras 3, Penguatkuasaan.
- JKMD provides national oversight.
- MTMD coordinates at state and district levels.
- Teras 4 and Teras 5 have distributed responsibility among relevant health, social, enforcement and international-affairs participants.

The 2017 policy identifies nine ministries, fifteen principal agencies/departments, NGOs, private/corporate bodies and communities as participants. It does not provide a complete exclusive assignment of every organisation to exactly one Teras.

### 4.2 Responsibility vocabulary

The platform and documentation must distinguish:

| Status | Meaning |
|---|---|
| Explicitly assigned | The policy directly associates the body with the function/Teras. |
| Policy-listed | The organisation is named as a participant but is not exclusively mapped to that Teras. |
| Functionally inferred | The relationship is reasonable from institutional function but not explicitly assigned by the supplied policy. |
| Requires stakeholder validation | The current owner, authority or mapping must be confirmed. |

Organisation names and hierarchies must be effective-dated master data. The current machinery, committee names and reporting obligations must be validated against the applicable 2024 coordination directive before production permissions or formal reports are baselined.

## 5. Intended Users

The expected user categories are:

- national leaders and committee members;
- state and district coordinators;
- agency contributors and data stewards;
- indicator owners;
- independent reviewers and approvers;
- programme and facility managers;
- approved aggregate-data analysts;
- specially authorised restricted-data analysts;
- committee secretariats;
- auditors;
- organisation administrators; and
- platform administrators.

User access must reflect role, organisation, geography, dataset/Teras, sensitivity and workflow state.

## 6. Product Vision

### 6.1 Core information architecture

The long-term product includes:

- one executive overview;
- one decision-oriented page for each Teras;
- a full-screen Malaysia threat-map workspace;
- a Data Hub for templates, uploads, validation and approval;
- an Indicator Registry and Data Catalogue;
- collaborative annotations, decisions and actions;
- safe exports and standard reports; and
- administration of users, organisations, geography, programmes, facilities, substances and indicators.

### 6.2 Shared evidence-to-action loop

```text
Agency submission
-> automated validation
-> steward attestation
-> independent approval
-> versioned publication
-> shared analysis
-> decision and assigned action
-> evidence of closure
```

The platform should make data ownership, source, definition, freshness, quality and revisions visible rather than presenting every number as equally authoritative.

## 7. Threat-Map Concept

The central visual concept is a Malaysia map that feels like a strategic threat map in a video game while remaining statistically and ethically defensible.

States, and later districts where data permits, may be displayed using green, yellow, orange, red and insufficient-data states. A colour must never be arbitrary or unexplained.

The map must separate:

- drug burden/demand;
- supply and enforcement threat;
- physical/social harm;
- prevention, treatment or harm-service gaps; and
- data confidence.

Users must be able to inspect the raw count, population-adjusted rate, denominator, time period, change, confidence, source and components driving a zone.

An overall composite score is a future option. It cannot be official until stakeholders approve its indicators, transformations, weights, missing-data rules and zone thresholds.

## 8. Supplied Data

The supplied *Statistik Mingguan AADK - Laporan 9 Ogos 2026* is a 15-page operational snapshot. It contains, among other values:

- 47,084 AADK clients: 44,906 mandatory and 2,178 voluntary;
- 5,260 clients across 30 institutional PUSPEN facilities;
- 41,824 community-based clients across 108 districts;
- 1,391 clients across 47 private rehabilitation centres;
- 5,208 cumulative complaints and 172 weekly complaints;
- 303 detainees across 18 detention/remand centres; and
- 24,947 arrests of persons suspected of drug offences.

It also provides demographic and operational breakdowns including sex, age, ethnicity, education, occupation, new/repeat status, state, facility and treatment setting.

### 8.1 What this enables

- A credible real-data Teras 2 caseload and facility snapshot.
- Selected Teras 3 complaint and suspected-person/arrest indicators.
- Cautious Teras 1 geographic and demographic burden context.
- A state-level map when authoritative population denominators are added and values reconcile.

### 8.2 What this does not establish

The report does not directly establish:

- prevention programme reach, completion, fidelity or effectiveness;
- an approved definition of recovery;
- sustained recovery at 3, 6 or 12 months;
- relapse, merely because a record is marked repeat;
- employment, education, housing, family or community reintegration;
- social acceptance or stigma reduction;
- comprehensive overdose, infectious-disease or harm-service outcomes;
- a complete enforcement pipeline from complaint to conviction; or
- substantive international-cooperation outcomes.

The platform must label these gaps rather than filling them with unsupported conclusions.

## 9. Version 1.0 Objective

V1 exists to convert a non-technical client's high-level idea into a concrete, testable system that stakeholders can react to.

The minimum credible demonstration is:

1. An executive opens the Malaysia threat map.
2. They see a priority state and its confidence level.
3. They switch among burden, supply, harm and service-gap layers.
4. They inspect the drivers, demographics, trends, source and owner.
5. They open the relevant Teras page.
6. They create a cross-agency action with an owner and deadline.
7. A steward uploads corrected data.
8. A separate reviewer approves it.
9. The publication version changes without erasing the earlier view or action context.

This demonstrates the intended value:

```text
shared evidence -> shared interpretation -> accountable coordinated action
```

## 10. V1 Data Strategy

### 10.1 Real supplied-data slice

- Teras 2 uses supported aggregate caseload, treatment setting, pathway, facility and demographic/geographic fields.
- Teras 3 uses supported complaint and suspected-person/arrest fields with legally careful terminology.
- Teras 1 uses demographic/geographic client data only as burden context.
- State-level map values must reconcile to the supplied source and approved denominators.

### 10.2 Demonstration-only slice

Synthetic data may demonstrate:

- prevention programmes, reach and outcomes;
- treatment follow-up, sustained recovery and reintegration;
- prosecution, seizure and final enforcement stages;
- harm events, screening and service coverage; and
- international agreements, commitments and outcomes.

Synthetic values must be structurally separate and visibly marked `DEMO / SYNTHETIC` everywhere, including exports.

## 11. Technical Direction

The discovery baseline proposes:

- Next.js 16.x App Router and strict TypeScript;
- React Server Components by default;
- accessible interactive charts and MapLibre GL JS or an approved equivalent;
- PostgreSQL with PostGIS;
- encrypted object storage for uploads and exports;
- isolated asynchronous workers for scanning, parsing, validation, aggregation, map preparation and exports;
- approved enterprise/government identity integration;
- RBAC combined with organisation/geography/data-sensitivity attributes;
- server-only data access and deliberately shaped DTOs; and
- versioned APIs and source contracts.

Exact packages, commands and deployment topology must be confirmed after Codex inspects the actual repository and the client confirms its environment.

## 12. Privacy and Sensitivity Context

The project may handle sensitive rehabilitation, health and enforcement information. The design must:

- prefer aggregate data;
- minimise fields;
- use pseudonymous identifiers only when longitudinal analysis is authorised;
- prevent unauthorised cross-agency identity linkage;
- protect exact locations and small counts;
- separate operational systems from analytical views;
- apply classification and access controls to data, files, comments and exports; and
- keep production personal data out of development and demonstrations.

The platform is decision support for authorised humans. It must not make automated decisions about individual guilt, enforcement targeting, treatment eligibility or personal risk.

## 13. Approved Assumptions

- The five Teras determine the principal policy pages.
- AADK is the overall lead/coordinator in the supplied 2017 policy.
- The application is collaborative, governed and BM-first.
- V1 may combine a real supplied-data slice with unmistakably synthetic scenarios.
- Population-adjusted rates are necessary for fair geographic comparison.
- The lowest available geography varies by dataset and permission.
- Data quality and confidence are part of the analysis, not hidden implementation details.
- Every official-looking value requires an approved definition, source, owner and publication status.

## 14. Prohibited Interpretations

- Do not equate repeat status with relapse.
- Do not equate treatment completion with sustained recovery.
- Do not equate arrest with guilt or drug prevalence.
- Do not infer prevention effectiveness from falling client or arrest counts alone.
- Do not interpret missing data as zero.
- Do not claim social acceptance from administrative records without a suitable measure.
- Do not describe a synthetic or proposed KPI as official.
- Do not treat geographic correlation as causation.

## 15. Known Risks

- Client terminology and success definitions remain incomplete.
- Current agency ownership may differ from the 2017 policy.
- The weekly report is insufficient for most outcome KPIs.
- Arbitrary threat-map bands could create false precision or political dispute.
- Small-area data can expose people or stigmatise communities.
- Different agencies may use incompatible definitions and reporting periods.
- Manual upload processes may reproduce rather than reduce reporting burden.
- A broad V1 could sacrifice quality and credibility.
- Synthetic data may be mistaken for real data without persistent labelling.

## 16. Decisions Still Required

Stakeholders must eventually approve:

- current governance bodies and the accountable owner for each Teras and dataset;
- participating V1 organisations;
- definitions of active, new, repeat, recovered, sustained recovery and reintegration;
- comparable legal stages and treatment modalities;
- in-scope harm-reduction services;
- population source and geography-boundary version;
- threat-map methods, thresholds, weights and suppression rules;
- lowest authorised geography and export rights;
- aggregate versus pseudonymous source data;
- hosting, identity, data residency and operational services;
- availability, recovery, browser, language and accessibility expectations; and
- ongoing platform and data-governance ownership.

## 17. Definition of Success for the Current Phase

The current phase succeeds when:

- the five Teras and their decision purposes are represented coherently;
- source-supported and proposed metrics are visibly distinct;
- the threat map is interactive, explainable and statistically honest;
- stakeholders can understand the upload-to-publication workflow;
- an accountable action can be created from an observation;
- supplied real values reconcile to the report;
- all demo data is unmistakable;
- no sensitive individual is exposed;
- non-technical users can identify a priority, its driver, its confidence and a next action; and
- the prototype produces specific stakeholder feedback that can baseline the next specification.

Production readiness, complete agency integration, live operational data and validated national outcome reporting are future-state goals, not claims of V1.
