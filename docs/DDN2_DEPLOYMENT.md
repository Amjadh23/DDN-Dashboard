# DDN 2.0 GitHub and Vercel publication

Date: 26 October 2026. User explicitly requested publication to a separate branch of `Amjadh23/DDN-Dashboard` and deployment to Vercel.

## GitHub snapshot

Branch: `codex/ddn2-four-teras`. First snapshot commit: `4f3c6ae69a498d874cc9b0736b7db179b6e10546`. GitHub remote SHA was verified after pushing. The target repository grants push permission. Existing `main` and the existing local `origin` remote were preserved. Generated artifacts, runtime state, local environment secrets and node_modules were excluded; the staged source/contract/tests/assets scan found no credential patterns.

The snapshot contains the human-approved four-pillar dashboard, its earlier user UI changes, annual/weekly supplied-source features and the validated compatibility strategy. The target repository's current main has a separate UI design and omits several annual-source capabilities. Those unrelated main changes were not overlaid on the approved dashboard.

## Existing Vercel integration

The push automatically triggered the existing project `amjadh23s-projects/ddndashboard`. GitHub reported its first preview build successful:

- Vercel deployment: `5sV87WRamHVYZ354fG2AA8qohVPP`.
- Preview URL: `https://ddndashboard-5bvcvfcrc-amjadh23s-projects.vercel.app`.
- Direct requests to `/` and `/ddn-2/teras/2` returned a Vercel SSO redirect, confirming deployment protection is enabled. This is not evidence that the application's authenticated routes are healthy.

The cached Vercel CLI is 65.2.0 and initially had no account credentials. Its device authorization link was presented to the user. Do not disable deployment protection or publish a temporary unclaimed project to bypass authentication.

## Compatibility changes

The target repository already contains explicit hosted-demo adapters. The branch ports the necessary behavior without importing the different UI or dropping annual source data:

- `PUBLIC_DEMO_HOST` explicitly enables only listed aliases. When running on Vercel with this opt-in configured, the trusted server-provided `VERCEL_URL` also permits this exact preview hostname. Arbitrary `*.vercel.app` hosts remain denied.
- Existing role, organization, geography, original-domain, sensitivity, workflow and disclosure checks remain intact. Hosted mutation requests require a matching HTTPS origin, including behind TLS termination. Local same-origin behavior remains supported. Hosted cookies use `secure`.
- Runtime geometry files are explicitly traced into the serverless bundle.
- `DATABASE_CONNECT_TIMEOUT_MS` supports the same cold-start timeout configuration as the existing deployed project. No database credentials, schema, grants or historical records are changed.
- `.vercel/` is ignored so any linked environment files stay private.

The new deployment-origin tests failed before the adapters existed; all 48 unit tests passed after implementation. Final build/integration outcomes and the final deployed commit are recorded in PLANS.md.

## Hosted-service limits

This remains a governed stakeholder prototype. Hosted database and session configuration must already exist in the Vercel project. Local loopback database credentials must never be uploaded or substituted. No remote schema migration or seed operation has been performed.

The existing upload scanner uses Windows Defender and an isolated asynchronous worker, while private upload/export files use local encrypted filesystem storage. Vercel's function filesystem cannot supply durable shared private storage or that Windows worker. A complete hosted upload/export lifecycle requires approved object storage and a separate scanning/parsing worker; a successful frontend build does not prove these services exist. Preserve these limits in the deployment handoff rather than claim complete hosted workflow support.

Next.js and the adjacent Zod audit findings remain separately tracked in `NEXTJS_SECURITY_ADVISORY.md`. No automatic dependency upgrade is included in this deployment compatibility commit.
