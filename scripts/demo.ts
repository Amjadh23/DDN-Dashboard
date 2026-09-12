import { spawn } from 'node:child_process';
import { databaseEnvironment, provision, runNode } from './environment';

// A separate seed baseline preserves the previous database and all historical evidence.
const name = 'dashboard_demo_refined_20260909';
if (process.argv.includes('--prepare')) {
  await provision(name);
  await runNode([
    'node_modules/tsx/dist/cli.mjs',
    '--conditions=react-server',
    'scripts/curate-demo.ts',
  ]);
  console.log(`Clean demonstration ready: ${name}. Previous database retained unchanged.`);
} else {
  const env = databaseEnvironment(name);
  const dev = process.argv.includes('--dev');
  if (process.argv.includes('--worker')) {
    await runNode(
      [
        'node_modules/tsx/dist/cli.mjs',
        '--conditions=react-server',
        'src/worker/run.ts',
        ...(process.argv.includes('--once') ? ['--once'] : []),
      ],
      env,
    );
    process.exit(0);
  }
  const worker = spawn(
    process.execPath,
    ['--import', 'tsx', '--conditions=react-server', 'src/worker/run.ts'],
    { env, stdio: 'inherit', windowsHide: true },
  );
  const app = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', dev ? 'dev' : 'start', '--hostname', '127.0.0.1'],
    { env, stdio: 'inherit', windowsHide: true },
  );
  const stop = () => {
    app.kill();
    worker.kill();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  app.on('exit', (code) => {
    worker.kill();
    process.exitCode = code ?? 1;
  });
}
