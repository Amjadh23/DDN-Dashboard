# Portable PostgreSQL/PostGIS Setup Report

## Result

The local `dashboard` database has PostGIS 3.6.2 installed and owned by
`dashboard_owner`. PostgreSQL remains a repository-managed portable process on
`127.0.0.1:55432`; no Windows service was created or changed.

The completion query used a WGS 84 envelope and point:

```sql
SELECT ST_Contains(
  ST_MakeEnvelope(100.0, 1.0, 104.0, 7.0, 4326),
  ST_SetSRID(ST_Point(101.6869, 3.1390), 4326)
) AS contains_kuala_lumpur;
```

Result: `true`.

## Binary identity and source

- Existing PostgreSQL: 17.11, 64-bit Windows, EDB binary archive documented in
  `docs/adr/0001-local-v1-architecture.md`. The installed `postgres.exe` SHA-256
  is `8ae8bb442e8a4c4fb2c8e9ad38c19aca610ee3cba33afd69249de769f905329b`.
- PostGIS source: official OSGeo Windows PG17 bundle,
  `https://download.osgeo.org/postgis/windows/pg17/postgis-bundle-pg17-3.6.2x64.zip`.
- Source metadata observed on 2026-09-07: 123,959,035 bytes; last modified
  2026-03-16 08:03:51 UTC; ETag `"69b7b967-76376fb"`; byte ranges supported.
- Runtime identity from `PostGIS_Full_Version()`: PostGIS 3.6.2, PostgreSQL ABI
  170, GEOS 3.14.1dev / CAPI 1.20.4, PROJ 8.2.1 with network access disabled,
  LIBXML 2.12.5, LIBJSON 0.12, LIBPROTOBUF 1.2.1, and internal WAGYU 0.5.0.

The source ZIP was acquired selectively because the pre-existing download was
sparse. `scripts/setup-postgis.py` used the valid central directory to repair
only required members with HTTP byte ranges. Python's `zipfile` validated each
selected member against the CRC in the central directory before installation.
The full sparse file is not represented as a verified full-archive download, so
no whole-archive SHA-256 claim is made.

## Installed additional files

Existing PostgreSQL files were not overwritten. These additional files came
from the PostGIS 3.6.2 bundle:

| Portable PostgreSQL path | Bytes | ZIP CRC32 | SHA-256 |
|---|---:|---|---|
| `lib/postgis-3.dll` | 1,778,176 | `a8e17094` | `d594e475ad094b0dd7e314e5188c87ff4ea9b5b01c9e130da42cdba29a8f23f1` |
| `bin/libgcc_s_seh-1.dll` | 117,427 | `e2b75b3b` | `ebce1962be9787e36b8b15112e79c4d41c31b6b9932ff40e232ce78dfb179bc8` |
| `bin/libgeos.dll` | 5,197,753 | `01674e76` | `e48d8aa98ba9d3de879bd796d56b0682bf68c4fe12b945fbfe955608c657ba74` |
| `bin/libgeos_c.dll` | 725,465 | `05af0914` | `2ffc245b2c0488e2b4509114ce6bb4516ab83390b7f52b2bbac90d809642a1fb` |
| `bin/liblzma-5.dll` | 184,667 | `4748d503` | `e5b17c53a932497f0994881b87a55381a282d0bab2e3bd41933b308fc7127f78` |
| `bin/libproj_8_2.dll` | 3,795,456 | `713a5c64` | `96cb1070bddb180a6ff87d2b5655b5fb1e9dac491a6671923dce02f597846335` |
| `bin/libprotobuf-c-1.dll` | 238,419 | `40279f97` | `f745dc985f89537141ddf6a33fee4e3db770b8a91788fc5ab2914e43de6a3808` |
| `bin/libsqlite3-0.dll` | 1,636,921 | `a885a0a0` | `15c2196c0b15e6c16de612af59cd678232a6f527fa38fb0f17e6f2568eb2b279` |
| `bin/libstdc++-6.dll` | 2,345,455 | `f38f0c59` | `913fcf6efa8b2f6b4c301b59005e81cccc2a02ab693cd995355a27b3b33df458` |
| `bin/libtiff-6.dll` | 1,949,565 | `234d07af` | `9bb9cfbdea96d46cdc4d834172f486fddca24e92118c634174d7fd5d64c9e65f` |
| `bin/libxml2-2.dll` | 1,773,366 | `26d2beb9` | `a14cd8d08c6a95ccdcc7d38e5491cf10c69800ea584568e0c20492638cee2975` |
| `share/extension/postgis--3.6.2.sql` | 7,478,083 | `1efc71d3` | `456ed04c502f6a0c1ab6eaac9def800c2b3b3daa33f463fe96269f2ea62663ff` |
| `share/extension/postgis.control` | 175 | `220bfac7` | `2802c2bb571cf648daafb834a452a7dc884ef359116a1b17ab4c4acd6155e699` |

The installer parsed PE import tables to find the transitive DLL set. It reused
compatible runtime DLLs already supplied by PostgreSQL and refused to overwrite
an existing file when its bytes differed from the selected bundle member.

## Commands and checks

Commands used, with connection credentials read locally and never printed:

```powershell
python -m py_compile scripts\setup-postgis.py
python scripts\setup-postgis.py

.runtime\postgresql\pgsql\bin\postgres.exe --version
.runtime\postgresql\pgsql\bin\pg_config.exe --version
.runtime\postgresql\pgsql\bin\pg_ctl.exe status -D .runtime\pg-data

psql <DATABASE_ADMIN_URL> -X -v ON_ERROR_STOP=1 \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;" \
  -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';" \
  -c "SELECT PostGIS_Full_Version();" \
  -c "SELECT ST_Contains(...);"
```

Verified outcomes:

- installer syntax check: passed;
- selected-member ZIP CRC validation: passed;
- repeated installer run: passed, with core files reported unchanged;
- PostgreSQL process status: running from `.runtime/pg-data`;
- extension creation: passed;
- extension identity: `postgis|3.6.2|dashboard_owner`;
- database endpoint identity: `dashboard|dashboard_owner|127.0.0.1/32|55432`;
- PostGIS native dependency loading: passed through `PostGIS_Full_Version()`;
- real spatial predicate: passed, `ST_Contains(...) = true`.

## Scope and traceability

This setup supplies the local relational/geospatial prerequisite for
`SPEC.md` requirement `NFR-006` and enables the spatial database validation
required by `ACC-003`. It does not by itself complete the schema, migrations,
spatial isolation tests, or production deployment decisions.

No project dataset, synthetic fixture, or personal data was used. Evidence
status is technical infrastructure; the policy/data evidence labels do not
apply to this installation. Credentials remain only in ignored local files.

`PLANS.md` was not changed in this bounded subtask. The parent M1 run owns its
progress log and the next milestone action: execute the migration and database
test suite against this validated PostGIS instance.
