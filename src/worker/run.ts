import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { withScope, audit } from '../lib/server/db';
import { readPrivate } from '../lib/server/private-storage';
import { validateRows } from '../lib/domain/uploads';
import type { Session } from '../lib/domain/policy';
const run = promisify(execFile);
const worker: Session = {
  id: 'demo-validation-worker',
  name: 'Pekerja validasi demo',
  role: 'steward',
  organisation: '*',
  geographies: ['*'],
  teras: [1, 2, 3, 4, 5],
  sensitivity: ['demo'],
  expires: Date.now() + 86400000,
};
async function once() {
  const job = await withScope(worker, async (c) => {
    await c.query(
      "UPDATE core.job SET state=CASE WHEN attempts>=3 THEN 'dead-letter' ELSE 'pending' END,error_code='lease_expired' WHERE state='running' AND locked_at<now()-interval '2 minutes'",
    );
    const found = await c.query(
      "SELECT j.id,j.submission_id,s.organisation,s.geography,s.teras,s.period::text,s.template,s.format FROM core.job j JOIN core.submission s ON s.id=j.submission_id WHERE j.kind='validate' AND j.state='pending' AND s.state IN ('quarantined','validating') ORDER BY j.created_at FOR UPDATE OF j SKIP LOCKED LIMIT 1",
    );
    if (!found.rowCount) return null;
    const row = found.rows[0];
    await c.query(
      "UPDATE core.job SET state='running',attempts=attempts+1,locked_at=now() WHERE id=$1",
      [row.id],
    );
    await c.query(
      "UPDATE core.submission SET state='validating',updated_at=now(),revision=revision+1 WHERE id=$1",
      [row.submission_id],
    );
    return row;
  });
  if (!job) return false;
  const scope = {
    ...worker,
    organisation: job.organisation,
    geographies: [job.geography],
    teras: [job.teras],
  };
  const scanDir = path.resolve('.runtime/scanning');
  await mkdir(scanDir, { recursive: true });
  const file = path.join(scanDir, `${job.submission_id}.${job.format}`),
    started = Date.now();
  try {
    await writeFile(file, await readPrivate(job.submission_id), { flag: 'wx' });
    const result = await run(
      process.execPath,
      [
        '--max-old-space-size=128',
        '--import',
        'tsx',
        path.resolve('src/worker/parse-upload.ts'),
        file,
        job.format,
      ],
      {
        cwd: process.cwd(),
        timeout: 60000,
        maxBuffer: 4 * 1024 * 1024,
        encoding: 'utf8',
        windowsHide: true,
        env: {
          NODE_ENV: 'production',
          SystemRoot: process.env.SystemRoot,
          PATH: process.env.PATH,
          TEMP: process.env.TEMP,
          TMP: process.env.TMP,
          SCANNER_PATH: process.env.SCANNER_PATH,
        },
      },
    );
    const rows = JSON.parse(result.stdout) as Record<string, unknown>[],
      validation = validateRows(rows, {
        template: job.template,
        teras: job.teras,
        geography: job.geography,
        period: job.period,
        organisation: job.organisation,
      });
    await withScope(scope, async (c) => {
      await c.query(
        "UPDATE core.submission SET state=$2,scan_status='clean',validation=$3,revision=revision+1,updated_at=now() WHERE id=$1",
        [
          job.submission_id,
          validation.errors.length ? 'invalid' : 'validated',
          JSON.stringify({ ...validation, checkedAt: new Date().toISOString() }),
        ],
      );
      await c.query("UPDATE core.job SET state='complete',finished_at=now() WHERE id=$1", [job.id]);
      await audit(
        c,
        scope,
        'validation-complete',
        job.submission_id,
        `Imbasan bersih; ${validation.errors.length} ralat kontrak, ${validation.warnings.length} amaran. Tempoh ${Date.now() - started} ms.`,
      );
    });
  } catch {
    await withScope(scope, async (c) => {
      await c.query(
        "UPDATE core.submission SET state='invalid',scan_status='failed',validation=$2,revision=revision+1,updated_at=now() WHERE id=$1",
        [
          job.submission_id,
          JSON.stringify({
            rows: [],
            warnings: [],
            errors: [
              {
                row: 0,
                column: 'file',
                code: 'scan_or_parse_failed',
                message:
                  'Imbasan atau pembacaan fail gagal. Semak perkhidmatan pengimbas, format dan had fail; tiada penerbitan dibenarkan.',
              },
            ],
          }),
        ],
      );
      await c.query(
        "UPDATE core.job SET state=CASE WHEN attempts>=3 THEN 'dead-letter' ELSE 'failed' END,error_code='scan_or_parse_failed',finished_at=now() WHERE id=$1",
        [job.id],
      );
      await audit(
        c,
        scope,
        'validation-failed',
        job.submission_id,
        `Gagal tertutup; tempoh ${Date.now() - started} ms. Kandungan tidak direkodkan.`,
        'denied',
      );
    });
  } finally {
    await unlink(file).catch(() => {});
  }
  console.log('Validation job finished; inspect the scoped submission for results.');
  return true;
}
if (process.env.DASHBOARD_MODE !== 'demo') throw new Error('Local demonstration worker only.');
do {
  const processed = await once();
  if (process.argv.includes('--once')) break;
  if (!processed) await new Promise((r) => setTimeout(r, 3000));
} while (true);
await (
  globalThis as unknown as { dashboardPool?: { end: () => Promise<void> } }
).dashboardPool?.end();
