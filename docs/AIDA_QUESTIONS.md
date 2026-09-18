# AIDA — question coverage — 17 September 2026

Presenter reference for the on-screen assistant (`AIDA — Asisten Inteligen Dasar Antidadah`, bottom-right of every page). It lists what AIDA can answer, the wording that reaches each answer, and where each answer can navigate.

Source of behaviour: `src/lib/domain/demo-assistant.ts`. Interface: `src/components/demo-assistant.tsx`.

## How matching works

AIDA matches lowercase keywords against the question and returns the **first** rule that matches, in the order listed below. It does not read the current page's values, filters or profile, and it does not create or change records. Questions are capped at 500 characters; the conversation stays in the browser session only.

Because the first match wins, a question that mixes topics lands on whichever rule appears earlier. "Berapa banyak data dalam peta?" reaches **Data provenance** (rule 4), not **Map**, because it contains "data". To demonstrate a specific answer, use the wording in its row.

Every phrase listed below was run against the matcher on 17 September 2026 and reaches the rule it appears under.

## Opening line

The greeting changes with the route the visitor is on:

| Route | Opening line |
| --- | --- |
| `/map` | Notes that the visitor is on the strategic map; offers layers or state selection. |
| `/teras/*` | Notes that the visitor is on one of the five Teras; offers indicators, sources or next steps. |
| Anywhere else | "Saya AIDA, pembantu digital Dasar Dadah Negara. Apa yang anda mahu terokai hari ini?" |

Opening quick replies: **Mulakan lawatan · Terangkan peta · Sumber data**.

## Questions AIDA answers

Rules are listed in matching order. Any one phrase in the "Ask" column is enough.

### 1. What AIDA is

Ask: *"Adakah anda ChatGPT?"* · *"Model apa yang anda guna?"* · *"Ini guna API?"*

Trigger words: `api` (as a whole word), `chatgpt`, `model`, `betul … ai`, `real ai`, `peraturan`.

Answers that it replies from prepared guidance for this dashboard and does not read current values or filters, then offers the guided tour. No link.

### 2. Personal medical questions (guardrail)

Ask: *"Rawatan apa yang sesuai untuk saya?"* · *"Boleh bagi diagnosis?"* · *"Berapa dos ubat?"*

Trigger words: `rawatan` + `saya`/`ubat`, `diagnos`, `dos ubat`, `medical`, `diagnosis`.

Declines personal treatment advice, refers the visitor to a health professional, and offers the purpose of the treatment and recovery page. Opens **Teras 2**.

### 3. Guided tour

Ask: *"Mulakan lawatan"* · *"Hai"* · *"Mula"* · *"Start tour"*

Trigger words: `lawatan`, `mula`, `tour`, `start`, `hello`, `hai`, `hi`.

Proposes the national overview first, then the map and a relevant Teras. Opens the **national overview** (`/`).

### 4. Data provenance and figures

Ask: *"Sumber data"* · *"Data ini sebenar atau demo?"* · *"Angka ini dari mana?"* · *"Berapa jumlahnya?"*

Trigger words: `sebenar`, `demo`, `sumber`, `data`, `official`, `real`, `angka` (as a whole word), `jumlah`, `berapa` — unless the question also says `muat naik`/`upload`, which sends it to rule 8.

Explains that "Data dibekalkan" points to the on-screen source citation and that "DEMO / SYNTHETIC" marks invented scenarios, and directs the visitor to "Definisi & sumber" on each card rather than quoting a value. Opens the **data catalogue** (`/data/catalog`).

### 5. Reading the map

Ask: *"Terangkan peta"* · *"Apa maksud lapisan?"* · *"Kadar atau bilangan?"* · *"Kenapa warna berbeza?"*

Trigger words: `peta`, `map`, `negeri`, `lapisan`, `kadar`, `bilangan`, `warna`.

Explains layer selection, the difference between rate and count, and the relative demo bands — green low, amber medium, red high — stating that these are not official threat thresholds. Opens the **strategic map** (`/map`).

### 6. Suppressed, zero and missing values

Ask: *"Apa maksud disekat?"* · *"Kenapa nilainya sifar?"* · *"Tiada nilai, kenapa?"*

Trigger words: `disekat`, `suppres`, `sifar`, `zero`, `tiada nilai`.

Separates a reported zero from a suppressed value, an unknown value and an uncollected value, and points to the map's patterns and labels. No link.

### 7. The five Teras

Ask: *"Apa itu lima Teras?"* · *"Terangkan pencegahan"* · *"Teras pemulihan"*

Trigger words: `teras`, `pillar`, `pemulihan`, `pencegahan`, `harm`.

Names all five Teras and what each page lets a visitor explore. Opens **Teras 2 — Rawatan & pemulihan**.

### 8. Upload and approval flow

Ask: *"Bagaimana proses muat naik?"* · *"Siapa yang beri kelulusan?"* · *"Terangkan aliran kerja"*

Trigger words: `muat naik`, `upload`, `kelulusan`, `approve`, `workflow`, `aliran`.

Walks through contributor upload, file validation, data custodian verification, independent review and secretariat publication, and states that a submitter cannot approve their own submission. Opens the **data hub** (`/data/uploads`).

### 9. Joint actions

Ask: *"Bagaimana cipta tindakan?"* · *"Ruang tindakan"* · *"Kerjasama"*

Trigger words: `tindakan`, `action`, `kerjasama`.

Explains owners, deadlines and required evidence, and states that AIDA can open a page but will not create or change a record. Opens **joint actions** (`/actions`).

### 10. Indicator definitions

Ask: *"Apa itu daftar indikator?"* · *"Definisi ukuran ini"*

Trigger words: `indikator`, `definisi`, `indicator`.

Describes what the register holds — meaning, unit, formula, source and interpretation limits — as the place to check a figure before using it. Opens the **indicator register** (`/indicators`).

### 11. Reports and exports

Ask: *"Bagaimana nak eksport?"* · *"Ruang laporan"* · *"Boleh muat turun report?"*

Trigger words: `laporan`, `report`, `eksport`, `export`.

Explains saved views, permission-dependent export, and that source and demo labels must travel with an export. Suggests switching to the Analyst profile first. Opens **reports and views** (`/reports`).

### Anything else

Any question that matches none of the above returns a short note that AIDA has no prepared answer for it, lists the topics it does cover — map, five Teras, data sources, uploads and actions — and offers the opening quick replies again.

## Suggested demo sequence

1. **Mulakan lawatan** — sets the national overview as the starting point.
2. **Terangkan peta** — opens the strategic map and explains rate against count.
3. *"Apa maksud disekat?"* — shows the disclosure-control vocabulary.
4. **Sumber data** — shows how provenance is labelled and where to verify it.
5. *"Bagaimana proses muat naik?"* — shows the separation of duties in the workflow.
6. *"Rawatan apa yang sesuai untuk saya?"* — shows the guardrail on personal medical advice.

## Limits worth stating to stakeholders

- AIDA answers from a fixed set of prepared responses; it is not connected to a language model, the database or the current filter state.
- It quotes no metric values, so nothing it says can contradict a figure on screen.
- It cannot create, approve or modify any record, and it declines personal medical advice.
- Messages stay in the browser session and are never stored.
