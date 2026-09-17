# Deploying to Vercel

The build succeeds without any configuration, but every route is a server component that reads the database and signs a session, so an unconfigured deployment returns a server error on all pages. This is the shortest path to a working demo deployment.

## 1. Create a Postgres with PostGIS

`database/migrations/001_initial.sql` begins with `CREATE EXTENSION IF NOT EXISTS postgis`, so the database must allow that extension. Neon's free tier does, and so does Vercel Postgres, which is built on Neon.

Create the database, then copy its connection string. Keep the `?sslmode=require` parameter. Prefer the **pooled** endpoint — the host contains `-pooler` — because each serverless invocation opens its own connections.

## 2. Load the schema and demo data

Both scripts run from your machine against the remote database; they are not part of the Vercel build.

Put the connection string in `.env.local` as the admin URL:

```
DATABASE_ADMIN_URL=postgresql://…?sslmode=require
SESSION_SECRET=<a long random string>
DASHBOARD_MODE=demo
```

Then:

```bash
npm run db:migrate
```

This creates a restricted `dashboard_app` role, applies both migrations, prints the PostGIS version, and **appends the generated `DATABASE_URL` to `.env.local`**. That generated URL — not the admin one — is what the application uses.

```bash
npm run db:seed
```

Without the seed the pages render with no values.

## 3. Set the environment variables in Vercel

Project → Settings → Environment Variables → Production:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the `dashboard_app` URL that `db:migrate` wrote into `.env.local` |
| `SESSION_SECRET` | the same long random string used above |
| `DASHBOARD_MODE` | `demo` |
| `PUBLIC_DEMO_HOST` | the deployment's hostname, e.g. `ddndashboard.vercel.app` |
| `DATABASE_CONNECT_TIMEOUT_MS` | `10000` (optional, see below) |

`DATABASE_ADMIN_URL` is only read by the migrate and seed scripts. Do not set it in Vercel.

### About `PUBLIC_DEMO_HOST`

The demonstration refuses to serve on any host other than loopback unless that host is named here. Both the page guard and the request-origin guard for uploads, approvals and profile switching consult it, so a deployment is opened deliberately and only for the hosts listed. Separate several hosts with commas — the production domain and the `…-git-main-….vercel.app` alias are different hosts.

Opening a deployment has a consequence worth stating plainly: a visitor arriving without a session cookie is given the `executive` demonstration identity, because the demonstration has no login. Anyone with the URL sees the dashboard as an executive. Use Vercel's deployment protection if the audience is meant to be limited.

## 4. Redeploy

Environment variable changes do not apply to an existing deployment. Trigger a new one from the Deployments tab, or push a commit.

## What does not work on Vercel

- **File uploads.** Encrypted upload bodies are written to `PRIVATE_STORAGE_ROOT`, which defaults to `/tmp/ddn-private` when the `VERCEL` environment variable is present. `/tmp` is writable but is not shared between invocations and does not survive them, so an uploaded file will not be readable afterwards. Everything up to the write succeeds; the upload workflow is not usable as a persistent feature until the store is moved to object storage.
- **Upload scanning.** The scanner shells out to Windows Defender, which does not exist on Vercel's Linux runtime.

The overview, strategic map, five Teras pages, indicator register, reports and the AIDA assistant do not depend on either.

## Cold starts

Neon's free tier suspends an idle database, and a suspended database can take longer to accept a connection than the pool's default 3 second timeout, which shows up as an intermittent server error on the first request. `DATABASE_CONNECT_TIMEOUT_MS` raises that timeout; `10000` is a reasonable value for a demo. The pooled endpoint also helps.

## Environment variables at a glance

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Vercel + local | Application database connection, restricted role |
| `DATABASE_ADMIN_URL` | local only | Migrations and seeding |
| `SESSION_SECRET` | Vercel + local | Session signing and private-storage key derivation |
| `DASHBOARD_MODE` | Vercel + local | `demo` enables the demo profile switcher |
| `PUBLIC_DEMO_HOST` | Vercel | Hosts allowed to serve the demonstration, comma separated; loopback is always allowed |
| `DATABASE_CONNECT_TIMEOUT_MS` | Vercel, optional | Connection timeout in milliseconds, default 3000 |
| `PRIVATE_STORAGE_ROOT` | optional | Overrides where encrypted upload bodies are written |
