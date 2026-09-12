import { spawn } from 'node:child_process';
import pg from 'pg';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { provision, runNode } from './environment';

const name = `dashboard_e2e_${Date.now()}`;
const env = await provision(name);
env.DASHBOARD_E2E = '1';
env.E2E_BASE_URL = 'http://127.0.0.1:3100';
const app = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3100'],
  { env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
);
let serverReady = false;
app.stdout.on('data', (bytes) => {
  process.stdout.write(bytes);
  if (bytes.toString().includes('Ready in')) serverReady = true;
});
app.stderr.on('data', (bytes) => process.stderr.write(bytes));
let exited = false;
app.on('exit', () => {
  exited = true;
});
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (exited) throw new Error('Isolated server could not start; refusing to use another server.');
    await new Promise((r) => setTimeout(r, 500));
    try {
      if (serverReady && (await fetch(env.E2E_BASE_URL)).ok) {
        ready = true;
        break;
      }
    } catch {}
  }
  if (!ready) throw new Error('Isolated server did not become ready.');
  await runNode(['node_modules/tsx/dist/cli.mjs', '--test', 'tests/database/*.test.ts'], env);
  if (!process.argv.includes('--database-only')) {
    await runNode(['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], env);
  }
} finally {
  app.kill();
  const admin = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
  try {
    // Only this run's generated test database may be removed; no demo or source history.
    if (!/^dashboard_e2e_\d+$/.test(name)) throw new Error('Unsafe cleanup target.');
    await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    const testRoot = path.resolve('.runtime', name);
    if (path.dirname(testRoot) !== path.resolve('.runtime'))
      throw new Error('Unsafe artifact cleanup target.');
    await rm(testRoot, { recursive: true, force: true });
  } finally {
    await admin.end();
  }
}
