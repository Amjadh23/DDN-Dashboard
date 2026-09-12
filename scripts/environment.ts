import pg from 'pg';
import { spawn } from 'node:child_process';
import path from 'node:path';

export function databaseEnvironment(name: string): NodeJS.ProcessEnv {
  if (!/^dashboard_(demo|e2e)_[a-z0-9_]+$/.test(name))
    throw new Error('Invalid isolated database name.');
  const env = { ...process.env };
  for (const key of ['DATABASE_URL', 'DATABASE_ADMIN_URL']) {
    if (!env[key]) throw new Error(`${key} is required.`);
    const url = new URL(env[key]!);
    if (!['127.0.0.1', 'localhost'].includes(url.hostname))
      throw new Error('Local databases only.');
    url.pathname = `/${name}`;
    env[key] = url.toString();
  }
  env.PRIVATE_STORAGE_ROOT = path.resolve('.runtime', name, 'private');
  return env;
}

export function runNode(args: string[], env = process.env) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: 'inherit', windowsHide: true });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Command failed (${code}): ${args[0]}`)),
    );
  });
}

export async function provision(name: string) {
  const env = databaseEnvironment(name);
  const admin = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
  try {
    if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [name])).rowCount) {
      await admin.query(`CREATE DATABASE "${name}"`);
    }
  } finally {
    await admin.end();
  }
  for (const file of ['migrate', 'seed']) {
    await runNode(['node_modules/tsx/dist/cli.mjs', `scripts/${file}.ts`], env);
  }
  return env;
}
