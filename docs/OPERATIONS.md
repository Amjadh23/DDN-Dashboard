# Local prototype operations

This is a loopback-only stakeholder prototype, not a production deployment. Existing `.env.local` contains generated local credentials and must remain private. Never copy it into documentation, exports or logs. The current workspace is Git-backed.

## Runtime

- Next.js16.3.4 / React19.2.8 / TypeScript5.9.3; Node >=20.9.0. Validation uses bundled Node24.19.0.
- PostgreSQL17.11 at `.runtime/postgresql/pgsql`, data `.runtime/pg-data`, port55432, database `dashboard`; PostGIS3.6.2. `docs/postgis-setup-report.md` records installation evidence.
- Prepare once: `npm run demo:prepare` creates/seeds `dashboard_demo_refined_20260909` and idempotently curates through existing validation/approval functions. The earlier `dashboard` database and private files remain intact for recovery.
- Application: `npm run dev` or `npm run build` followed by `npm run start`; loopback3000. Wrappers select the curated database and start its worker. Do not use `next start` directly: the original environment intentionally retains the previous database URL.
- Worker starts automatically with the app. `npm run worker` starts another only if needed; `npm run worker:once` processes one demo job.

Start an existing stopped database from the repository root:

```powershell
& '.runtime/postgresql/pgsql/bin/pg_ctl.exe' -D '.runtime/pg-data' -l '.runtime/postgres.log' start
npm run db:migrate
```

Do not initialise a second data directory or reset existing data. The refined demo uses the existing PostgreSQL instance with a separate database. `demo:prepare` inserts missing fixtures without rewriting historical publications. Low-level `db:migrate`/`db:seed` use the URLs supplied to their process; use `demo:prepare` for the active demonstration.

## Isolated regression tests

`npm run test:e2e` provisions a fresh `dashboard_e2e_<timestamp>` database, migrates/seeds it, starts its own production server on3100, runs DB/browser tests, then removes only that generated database and its private files. `npm run test:db` runs database checks through the same isolation. Build first. Direct browser/database test execution against the demo is rejected. The test worker inherits the isolated database and storage namespace. A busy3100 port fails closed.

`tsx --env-file=.env.local scripts/demo-status.ts` checks demo record counts. The curated set has four actions (one independently closed), two notes/decisions, two scanned submissions (one published, one awaiting attestation) and one saved report. Session audit records legitimately grow when users change profiles. The old test clutter is absent from the active instance and recoverable in the previous database.

## Upload and publication

Eight templates accept schema1.0 aggregate synthetic rows. Maximum2MiB /1000rows. CSV requires UTF-8 and exact headers; XLSX is preflighted for ZIP expansion, macros, external links and formulas. Windows Defender scans before parsing. If scanning fails, validation fails closed.

Targets expire after10minutes and are bound to the issuing actor. Encrypted quarantine is `.runtime/<database>/private` through the demo/test wrappers; short-lived plaintext is generated only inside `.runtime/scanning` for the isolated parser and removed after the job. AES-GCM uses a key derived from SESSION_SECRET: changing that secret invalidates sessions and prevents reading previously encrypted files. Do not rotate it casually.

The contributor uploads; steward attests source/coverage/quality; reviewer independently approves/rejects with reason; secretariat publishes. Revisions reference the prior publication and retain history. Queue leases/retries are bounded; platform-admin can inspect job-state counts. Scanner/parser child has memory/time/output bounds and receives no DB/session secret. Production OS-level sandboxing is still required.

## Collaboration and reports

Actions require evidence and a verifier separate from the owner/evidence author. Notes cannot edit observations. Reports freeze disclosed DTOs and publication/definition/boundary versions. CSV/XLSX exports contain separate supplied and DEMO / SYNTHETIC sections, are encrypted, actor-private and expire after15minutes. Scope/permission is rechecked at generation and download. Large reports are explicitly unavailable. Browser print is supported by print CSS; it is not a signed official report.

Organisation/platform demo administrators append access scopes and revoke sessions. Indicator administrators can append demo reference proposals. No administrator silently inherits business-data rights. Historical policy ownership is never changed by a demo reference entry.

## Operational limitations

No production IdP, SSO/MFA, object-storage service, backup/restore service, infrastructure monitoring, external notifications or external integrations are configured. Retention/deletion, deployment topology, secrets management, access authority and RTO/RPO need stakeholder approval. Encrypted expired files remain on local disk pending an approved retention policy; expiry prevents API retrieval.

The supplied PDFs remain at their original `data/` and `references/` paths. `requirements.md` is absent. Official denominators, district boundaries/data, thresholds, recovery definitions and current2026 ownership remain unresolved and visibly gated. Do not treat sample population or continuous map shading as an official threat classification.
