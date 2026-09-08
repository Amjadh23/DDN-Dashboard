# Supplied-source reconciliation

## Scope and method

This note records the aggregate V1 seed values that were visually verified from the supplied 15-page scanned report and the policy statements needed for prevention strategy and responsibility metadata. It supports `ACC-008`, `ACC-023`, `FR-T1-001`, `FR-T1-002`, `FR-T1-003`, `FR-T2-001`, `FR-T2-002`, `FR-T3-001`, and `FR-T3-002`.

The weekly report was rendered page by page with Poppler and all 15 pages were inspected. The policy pages cited below were also rendered and inspected. Extracted text was used only to locate content; the visible page is the authority. No person-level data was used.

| Source | Repository path | SHA-256 | Pages |
|---|---|---|---:|
| *Statistik Mingguan AADK - Laporan 9 Ogos 2026* | `data/Data_STATISTIK MINGGUAN AADK-LAPORAN 9 OGOS 2026.pdf` | `5c7d9dbc0ed71bc666d03b4a3749367d8c90683d8f51761a24e90c98f78844d3` | 15 |
| *Dasar Dadah Negara 2017* | `references/Dasar-Dadah-Negara-BM_compressed.pdf` | `67525aa7f78377f05f9caf101f337bc8aac41d6f8ce94bbd507f0573486c7cc4` | 96 |

The repository paths differ from the `project_sources/...` paths registered in `REFERENCES.md`. The content at the actual paths above was used. `requirements.md` is missing and was not reconstructed.

The machine-readable seed is `data/supplied/weekly-2026-08-09.json`. Every observation retains the visible Malay label and report page. The JSON is `Available` supplied aggregate data, not `DEMO / SYNTHETIC` data.

## Weekly report totals

Page 2, headed **RINGKASAN KESELURUHAN sehingga 09 Ogos 2026**, displays these headline values:

| Displayed measure | Value | Reconciliation |
|---|---:|---|
| `KESELURUHAN AADK` | 47,084 clients | 44,906 `Mandatori` + 2,178 `Sukarela` = 47,084 |
| `RAWATAN DAN PEMULIHAN DALAM INSTITUSI (RPDI)` | 5,260 clients; 30 PUSPEN | 4,518 `Mandatori` + 742 `Sukarela` = 5,260 |
| `RAWATAN DAN PEMULIHAN DALAM KOMUNITI (RPDK)` | 41,824 clients; 108 districts | 40,388 `Mandatori` + 1,436 `Sukarela` = 41,824 |
| `PUSAT PEMULIHAN PERSENDIRIAN (PPP)` | 1,391 clients; 47 centres | Separate source block; no mandatory/voluntary split displayed |
| `JUMLAH ADUAN` | 5,208 cumulative; 172 weekly | Page 11 state rows reconcile to both totals |
| `PUSAT SARINGAN PENILAIAN DADAH (PSPD)` | 303 OKT; 18 centres | Page 12 headline says 15 PSPD + 3 lockups = 18 |
| `ORANG YANG DISYAKI (OYDS)` | 24,947 `Tangkapan` | Page 13 state rows sum to 24,947 |

RPDI plus RPDK equals the displayed 47,084 AADK clients. PPP is presented as a separate block and must not be added to 47,084 without confirmation that its population and overlap are understood.

## State-level values suitable for V1

The following table joins three separate report measures for inspection only. It does not imply that they share a denominator, definition, causal relationship, or risk meaning.

| Geography label | RPDK mandatory | RPDK voluntary | RPDK total | Complaints cumulative | Complaints weekly | OYDS `Tangkapan` |
|---|---:|---:|---:|---:|---:|---:|
| Johor | 5,196 | 101 | 5,297 | 749 | 18 | 2,697 |
| Kedah | 4,968 | 148 | 5,116 | 680 | 23 | 3,003 |
| Selangor | 4,746 | 253 | 4,999 | 919 | 32 | 2,839 |
| Kelantan | 4,138 | 164 | 4,302 | 247 | 6 | 2,008 |
| Terengganu | 3,735 | 46 | 3,781 | 192 | 1 | 1,445 |
| Perak | 3,319 | 114 | 3,433 | 498 | 25 | 3,012 |
| Pulau Pinang | 3,054 | 84 | 3,138 | 174 | 6 | 1,701 |
| Pahang | 3,018 | 97 | 3,115 | 205 | 10 | 2,222 |
| Sarawak | 2,596 | 180 | 2,776 | 444 | 25 | 1,411 |
| W. Persekutuan / Wilayah Persekutuan | 1,487 | 74 | 1,561 | 230 | 4 | 1,742 |
| N. Sembilan / Negeri Sembilan | 1,312 | 33 | 1,345 | 103 | 3 | 734 |
| Sabah | 1,152 | 85 | 1,237 | 595 | 12 | 924 |
| Melaka | 931 | 44 | 975 | 117 | 2 | 624 |
| Perlis | 736 | 13 | 749 | 55 | 5 | 585 |
| **Reconciled total** | **40,388** | **1,436** | **41,824** | **5,208** | **172** | **24,947** |

Sources and exact headings:

- Page 7: `PROFILING KLIEN RPDK (JUMLAH: 41,824)` and `Taburan Klien Mengikut Negeri`. Each state bar prints `M` and `S` components and a total.
- Page 11: `TABURAN ADUAN MENGIKUT NEGERI (TERKUMPUL/MINGGUAN)` with `Aduan Terkumpul: 5,208 | Aduan Mingguan: 172`.
- Page 13: `TABURAN ORANG YANG DISYAKI (OYDS) sehingga 09 Ogos 2026` with `Tangkapan: 24,947`.

The report uses the combined geography `W. Persekutuan` or `Wilayah Persekutuan`; it does not split Kuala Lumpur, Putrajaya, and Labuan. It therefore cannot be joined to a single standard state polygon without an approved mapping or source disaggregation. Page 11 also prints `Ibu Pejabat` without a visible number. It is recorded as unresolved, not as zero; the 14 numbered geography rows already reconcile to both displayed complaint totals.

These are raw counts. No state population denominators, denominator year/version, district facts, or boundary version are supplied. They can support a count layer and ranked table. They cannot yet support a population-rate choropleth or district drill-down.

## Demographic profiles

Each listed demographic dimension sums exactly to its displayed parent total.

### Overall AADK profile - page 4

Heading: `PROFILING KLIEN AADK` / `JUMLAH: 47,084`.

- Sex icons: male icon 44,756; female icon 2,328.
- Age: `Kanak-kanak (<=14 thn)` 6; `Belia (15-30 thn)` 13,953; `Dewasa (31-59 tahun)` 32,252; `Warga Emas (>=60 tahun)` 873.
- `Bangsa`: `Melayu` 38,131; `India` 2,644; `Cina` 2,082; `Pribumi Sabah` 1,443; `Pribumi Sarawak` 1,376; `Lain-lain` 1,408.
- `Tahap Pendidikan`: `Tiada Pendidikan Formal` 1,791; `Sekolah Rendah` 4,830; `Sekolah Menengah` 36,497; `Universiti` 1,893; `Kemahiran` 2,073.
- `Pekerjaan Semasa Daftar`: `Swasta` 20,940; `Buruh Am` 12,684; `Tiada Pekerjaan` 4,344; `Bekerja Sendiri` 3,397; `Penganggur` 3,422; `Rencam/Sambilan` 1,650; `Kerajaan` 367; `Penuntut` 188; `Pesara` 92.

### RPDI profile - page 6

Heading: `PROFILING KLIEN RPDI (SAMB.)` / `Jumlah: 5,260`.

- Sex icons: male icon 5,017; female icon 243.
- Age: `Kanak-kanak (<=14 thn)` 4; `Belia(15-30 thn)` 1,586; `Dewasa (31-59 thn)` 3,662; `Warga Emas(>=60 thn)` 8.
- `Status Klien`: `Baharu` 2,793; `Berulang` 2,467.
- `Bangsa`: `Melayu` 4,431; `India` 232; `Lain-lain` 189; `Pribumi Sabah` 185; `Pribumi Sarawak` 151; `Cina` 72.
- `Tahap Pendidikan`: `Tiada Pendidikan Formal` 135; `Sekolah Rendah` 526; `Sekolah Menengah` 4,162; `Universiti` 198; `Kemahiran` 239.

### RPDK profile - page 8

Heading: `PROFILING KLIEN RPDK (SAMB.)` / `Jumlah: 41,824`.

- Sex icons: male icon 39,739; female icon 2,085.
- Age: `Kanak-kanak (<=14 thn)` 2; `Belia (15-30 thn)` 12,367; `Dewasa (31-59 tahun)` 28,590; `Warga Emas(>=60 tahun)` 865.
- `Status Klien`: `Baharu` 25,743; `Berulang` 16,081.
- `Bangsa`: `Melayu` 33,700; `India` 2,412; `Cina` 2,010; `Pribumi Sabah` 1,258; `Pribumi Sarawak` 1,225; `Lain-lain` 1,219.
- `Tahap Pendidikan`: `Tiada Pendidikan Formal` 1,656; `Sekolah Rendah` 4,304; `Sekolah Menengah` 32,335; `Universiti` 1,695; `Kemahiran` 1,834.
- `Pekerjaan Semasa Daftar`: `Swasta` 18,929; `Buruh Am` 11,138; `Tiada Pekerjaan` 3,762; `Bekerja Sendiri` 3,046; `Penganggur` 2,836; `Rencam/Sambilan` 1,517; `Kerajaan` 354; `Penuntut` 156; `Pesara` 86.

### PPP profile - page 10

Heading: `PROFILING KLIEN PPP (SAMB.)` / `Jumlah: 1,391`.

- Sex icons: male icon 1,368; female icon 23.
- Age: `Kanak-kanak (<=14 thn)` 7; `Belia (15-30 thn)` 565; `Dewasa (31-59 thn)` 801; `Dewasa (>=60 thn)` 18.
- `Bangsa`: `Melayu` 1,092; `Cina` 239; `India` 30; `Lain-lain` 25; `Pribumi Sabah` 3; `Pribumi Sarawak` 2.
- `Tahap Pendidikan`: `Tiada Pendidikan Formal` 207; `Sekolah Rendah` 95; `Sekolah Menengah` 974; `Universiti` 62; `Kemahiran` 53.
- `Pekerjaan Semasa Daftar`: `Swasta` 352; `Bekerja Sendiri` 70; `Kerajaan` 8; `Buruh Am` 228; `Penganggur` 183; `Penuntut` 5; `Tiada Pekerjaan` 186; `Rencam/Sambilan` 357; `Pesara` 2.

The sex categories are communicated by gendered blue/pink icons rather than written category labels. The JSON records the icon presentation and a machine key, but an indicator definition must confirm the source field semantics before publication. Page 10 also labels the 60-plus PPP group `Dewasa (>=60 thn)`, unlike the overall/RPDI/RPDK `Warga Emas` label. The source wording is preserved.

## Pathway and source-status values

The report supports pathway and source-status displays, but it does not define clinical outcome, recovery, or relapse.

| Scope | Displayed category | Value | Source |
|---|---|---:|---|
| Overall AADK | `Mandatori` | 44,906 | Page 2 |
| Overall AADK | `Sukarela` | 2,178 | Page 2 |
| RPDI | `Mandatori` | 4,518 | Page 2 |
| RPDI | `Sukarela` | 742 | Page 2 |
| RPDK | `Mandatori` | 40,388 | Page 2 |
| RPDK | `Sukarela` | 1,436 | Page 2 |
| RPDI `Status Klien` | `Baharu` | 2,793 | Page 6 |
| RPDI `Status Klien` | `Berulang` | 2,467 | Page 6 |
| RPDK `Status Klien` | `Baharu` | 25,743 | Page 8 |
| RPDK `Status Klien` | `Berulang` | 16,081 | Page 8 |

Page 7 further breaks the RPDK pathways down under `Profiling Klien Rawatan dan Pemulihan dalam RPDK per Individu`:

- `Mandatori`: `Sek. 38B (Denda) ADB 1952` 14,634; `Sek. 38B (Penjara) ADB 1952` 5,085; `Sek. 6(1)(a) APD (R&P) 1983` 7,888; `Sek. 6(1)(b) APD (R&P) 1983` 7,890; `Sek. 6(2)(a) APD (R&P) 1983` 10; `Sek. 6(2)(b) APD (R&P) 1983` 4,256; `Sek. 6A(2)(a) APD (R&P) 1983` 625. Sum: 40,388.
- `Sukarela`: `Sek. 9(2)(b) APD (R&P) 1983` 30; `Sek. 8(3)(b) APD (R&P) 1983` 632; `Sek. 8(3)(a) APD (R&P) 1983` 774. Sum: 1,436.

`Berulang` means only repeat source status in this report. It must never be displayed as relapse. Neither completion nor sustained recovery is measured here.

## Policy prevention strategies

The six prevention strategies are displayed together under `KONSEP DAN DASAR` on printed page 31 (PDF page index 38):

| Source letter and exact name | Policy description, closely paraphrased |
|---|---|
| (a) `Penyebaran Maklumat` | Provide target groups with information through suitable channels, including new, broadcast, face-to-face, outdoor, and print media. |
| (b) `Pendidikan Pencegahan secara formal` | Use two-way, interactive teaching and learning to build target-group prevention knowledge and skills. |
| (c) `Pemerkasaan Komuniti` | Equip community members to plan, implement, and evaluate effective prevention programmes. |
| (d) `Persekitaran` | Create drug-free community environments through values, codes, and attitudes. |
| (e) `Identifikasi dan rujukan` | Establish a system to identify people involved in drug misuse and determine prevention help or treatment referral. |
| (f) `Alternatif` | Mobilise community groups to promote drug-free activities and lifestyles. |

These are `Policy` categories for programme classification under `FR-T1-003`. The weekly report contains no prevention programme records or results, so counts, reach, completion, and effectiveness under these strategies remain `Proposed`.

## Policy responsibility and monitoring trace

| Responsibility statement | Classification | Visual source basis |
|---|---|---|
| AADK is the principal agency and lead in the drugs field and coordinates integrated cooperation among responsible parties. | `explicitly assigned` | Printed page 20 (PDF page index 27), `FUNGSI DAN AGENSI PELAKSANA DASAR`. |
| Nine ministries and fifteen principal government agencies/departments are involved. | `policy-listed` | Printed page 21 (PDF page index 28), `PENDAHULUAN`. The page lists participants; it does not assign each exclusively to one Teras. |
| JPPP is associated with prevention and publicity, JPU with legal enforcement, and JRP with treatment and rehabilitation. | `explicitly assigned` to the named functions | Printed page 87 (PDF page index 94), `PEMANTAUAN TERAS`, where the full committee names are listed. |
| JKMD receives evaluation reporting and sits above the listed implementation machinery. | `explicitly assigned/general governance` | Printed page 87, which states that evaluation results are reported to JKMD and the machinery beneath it. |
| MTMD operates at state and district levels. | `explicitly assigned/general governance` | Printed page 87: `Majlis Tindakan Membanteras Dadah (MTMD) di peringkat negeri dan daerah`. |
| A single exclusive Teras 4 or Teras 5 agency owner | `requires stakeholder validation` | No exclusive owner is printed on the inspected responsibility/monitoring pages. |
| Exact current 2026 committee hierarchy and authority | `requires stakeholder validation` | The 2017 policy's printed page 87 refers to reporting machinery formed under Prime Minister's Directive No. 1 of 2004. |

Printed page 85 (PDF page index 92), `JAWATANKUASA PENILAI`, says each policy pillar should establish its own evaluator committee, but its sentence enumerates prevention, treatment and rehabilitation, enforcement, and harm reduction and does not name international cooperation. This omission is preserved as an ambiguity; it must not be converted into a claim that Teras 5 has no evaluation responsibility.

## Use boundaries and unresolved items

- The state data can power raw-count tables and a workload/count layer only. Rates require an approved population source, year/version, and boundary mapping. No green/yellow/orange/red threshold is supported by either supplied source.
- The report is a single snapshot. It does not supply an earlier comparison period, trend series, freshness SLA, formal field definitions, confidence formula, indicator owner, or publication workflow status.
- Counts, clients, complaints, OKT, and suspected-person arrests are distinct units and must remain distinct.
- Complaints are signals, not confirmed offences. OYDS `Tangkapan` counts do not establish guilt, conviction, or prevalence.
- Demographic client counts can provide cautious burden context for Teras 1. They do not measure prevention reach or effectiveness.
- PPP values are structurally separate in the JSON because their relationship to the AADK total is not stated.
- The page 12 red headline clearly shows `Jumlah Pusat: 18 (15 PSPD, 3 Lokap)`. The footer wording is visually unclear and should be confirmed with the source owner before finer facility reporting.
- Detailed facility capacities and named centres on pages 5, 9, and 12 were not encoded in this bounded aggregate seed. Their operational status notes and possible overlaps need a dedicated facility-master review.
- The policy is historical 2017 evidence. Organisation names, committee hierarchy, and operational permissions must be effective-dated and validated against current coordination machinery before production use.

## Reconciliation result

All encoded complete breakdowns pass integer reconciliation to their displayed parent totals: overall AADK demographics 47,084; RPDI demographics/status 5,260; RPDK demographics/status/state/legal-basis 41,824; PPP demographics 1,391; complaints 5,208 cumulative and 172 weekly; and OYDS `Tangkapan` 24,947. No unsupported rate, relapse, recovery, guilt, prevalence, prevention-effectiveness, or threat-band interpretation was added.
