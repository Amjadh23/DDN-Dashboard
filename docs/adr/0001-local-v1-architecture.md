# ADR 0001 — Local governed V1 prototype

Status: accepted for the authorised local stakeholder prototype; production baseline unapproved.

The initial repository contains only the specification and sources. Next.js 16 App Router, strict TypeScript, React Server Components and a server-only DAL follow `SPEC.md` NFR-001..006. Dependency versions are pinned in package.json and its lockfile. The bundled Node 24 runtime avoids changing the system Node 20.18 installation.

PostgreSQL 17 and PostGIS 3.6 portable Windows distributions are being provisioned under ignored `.runtime/`; this does not register a Windows service. Database startup/extension compatibility is an M1 gate. Application authentication and scope are enforced in the DAL and mutation handlers, with PostgreSQL constraints and immutable publication/audit records as a second boundary. Production roles must never own tables or have superuser privileges.

The prototype's demonstration actors are fictional identities. Access is limited to loopback and the demo schema. No production organisation authority, clinical outcome definition or permission is inferred. Production mode is fail-closed pending approved identity, storage, scanning and governance adapters. Real data are limited to the supplied already-aggregate report, reconciled against visible pages; synthetic values live separately and cannot be published as official.

Interactive geographic rendering uses aggregate GeoJSON only, with an equivalent HTML table and no sensitive event coordinates. Official classification and composite controls remain disabled. Demonstration boundaries/denominators and any example status rule must have a visible version and explanation.

Quarantined uploads and asynchronous parsing live outside Next request execution. A real malware scanner is required for arbitrary uploads; a controlled generated fixture may exercise the isolated synthetic workflow only if clearly disclosed as such. A scanner error must never be reported as a clean scan.

Sources checked 2026-09-07:

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation): runtime and separate lint requirements.
- [EDB binary archives](https://www.enterprisedb.com/download-postgresql-binaries): PostgreSQL 17.11 Windows archive.
- [PostGIS Windows installation](https://postgis.net/documentation/getting_started/install_windows/): Windows compatibility/distribution guidance.
- [PostGIS 17 binary distribution](https://download.osgeo.org/postgis/windows/pg17/): 3.6.2 bundle.

Consequences: no cloud credentials are needed for local validation. Production release remains blocked by SPEC section 23 and SEC-019; passing local tests does not establish production readiness. Database and worker tests must run against actual PostgreSQL/PostGIS before the associated requirements are declared satisfied.
