# Implementation source register

Protected documents retain their supplied paths. Contract path `project_sources/01-Data_STATISTIK-MINGGUAN-AADK-LAPORAN-9-OGOS-2026.pdf` maps to `data/Data_STATISTIK MINGGUAN AADK-LAPORAN 9 OGOS 2026.pdf`; policy path maps to `references/Dasar-Dadah-Negara-BM_compressed.pdf`; workflow guide maps to `references/General_SDD_ChatGPT_Codex_Workflow_Guide.md`. Root `requirements.md` is absent. No source document has been changed.

## Weekly snapshot — Available

Visual inspection of PDF page 1 confirms the reporting date, 9 August 2026. PDF page 2 (printed page 2), “Ringkasan Keseluruhan sehingga 09 Ogos 2026”, confirms:

| Visible measure | Value |
|---|---:|
| Keseluruhan AADK | 47,084 |
| Mandatori / Sukarela | 44,906 / 2,178 |
| RPDI, 30 PUSPEN | 5,260 |
| RPDI mandatori / sukarela | 4,518 / 742 |
| RPDK, 108 daerah | 41,824 |
| RPDK mandatori / sukarela | 40,388 / 1,436 |
| PPP, 47 pusat | 1,391 |
| Aduan keseluruhan / mingguan | 5,208 / 172 |
| PSPD, 18 pusat, jumlah OKT | 303 |
| OYDS, tangkapan | 24,947 |

Reconciliation: 44,906 + 2,178 = 47,084; 5,260 + 41,824 = 47,084; 4,518 + 742 = 5,260; 40,388 + 1,436 = 41,824. PPP is shown separately; it is not added to the AADK total. “Active” is not asserted beyond the report label. A suspected-person arrest is not guilt, conviction or prevalence. A complaint is a signal, not a confirmed offence. Only one source date is available, so official period changes remain not calculable.

The PDF is image-based; `pypdf` extracts only scanner marks. Rendered pages, not OCR, establish values. Further checked detail and hashes are recorded in `docs/source-reconciliation.md` when completed.

## Demonstration geography — Validation required

[geoBoundaries MYS ADM1 API](https://www.geoboundaries.org/api/current/gbOpen/MYS/ADM1/) returns boundary ID `MYS-ADM1-15666254`, year represented 2017, 16 units, OSM/Wambacher source, ODbL 1.0. The pinned revision is `9469f09`; the actual runtime asset is `public/geo/malaysia-states-data.geojson` (SHA256 `FB0F76F0F987C748B732EF02049113946DB2DD5FC604130D4A0FBAB4E74D4012`). The earlier `malaysia-states.geojson` download is an unused Git LFS pointer, preserved for inspection.

[Pinned simplified GeoJSON](https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/MYS/ADM1/geoBoundaries-MYS-ADM1_simplified.geojson). Attribution: geoBoundaries / OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright). It is a demonstration geographic reference, not an approved national boundary baseline. Geometry is not evidence of threat or agency jurisdiction. No districts are supplied or rendered. Synthetic denominators must never generate official rates.

## World reference map — demonstration only

`public/geo/world-countries.geojson`, SHA256 `6866C877D39CBA9C357620878839B336D569F8C662D3CFAB4CB1DBE2D39C977F`, supplies generalised country outlines for the Teras5 scenario. The asset identifies Natural Earth country geometry; [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/) place its map data in the public domain. The acquisition revision was not retained in the interrupted run; hash pins the local artifact, but acquisition provenance remains incomplete. Country points are fictional partner illustrations, not diplomatic relationships, jurisdictions or precise operational locations. No official national-boundary acceptance is implied.
