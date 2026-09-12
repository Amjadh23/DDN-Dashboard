import pg from 'pg';
import { databaseEnvironment, runNode } from './environment';
import { demoIdentities } from '../src/lib/domain/demo-identities';
import { defaultFilters } from '../src/lib/domain/filters';
import type { Session } from '../src/lib/domain/policy';

// Populate through the same permission, validation and audit paths used by the UI.
Object.assign(process.env, databaseEnvironment('dashboard_demo_refined_20260909'));
const { addDecision, updateAction } = await import('../src/lib/server/collaboration');
const { createUploadTarget, acceptUpload, getSubmissions, changeSubmission } =
  await import('../src/lib/server/workflow');
const { getSavedReports, saveReport } = await import('../src/lib/server/reports');
const admin = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
const actor = (role: string): Session => ({
  ...demoIdentities[role],
  expires: Date.now() + 3600000,
});
const context = { geography: 'MY', teras: 1, period: '2026-08-09' };
try {
  for (const [kind, body] of [
    [
      'note',
      'Semakan demo: utamakan jurang liputan komuniti. Angka rekaan ini digunakan untuk membincangkan keperluan data negeri.',
    ],
    [
      'decision',
      'Keputusan demo: pengurus program menyelaraskan semakan liputan sebelum mesyuarat berikutnya; pemilik data negeri perlu disahkan.',
    ],
  ]) {
    if (!(await admin.query('SELECT 1 FROM core.note WHERE body=$1', [body])).rowCount) {
      await addDecision(actor('executive'), { kind, body, context });
    }
  }
  const title = 'Semak keselarasan definisi liputan komuniti';
  const existing = await admin.query('SELECT id,status,revision FROM core.action WHERE title=$1', [
    title,
  ]);
  const action = existing.rows[0] ?? {
    ...(await addDecision(actor('programme-manager'), {
      kind: 'action',
      body: title,
      context,
      owner: 'demo-programme-manager',
      dueDate: '2026-09-08',
      priority: 'normal',
    })),
    status: 'open',
    revision: 1,
  };
  if (action.status === 'open') {
    await updateAction(actor('programme-manager'), action.id, {
      status: 'in-progress',
      revision: action.revision,
    });
    action.status = 'in-progress';
    action.revision++;
  }
  if (action.status === 'in-progress') {
    await updateAction(actor('programme-manager'), action.id, {
      status: 'review',
      revision: action.revision,
      evidence:
        'DEMO / SYNTHETIC · Nota semakan: kehadiran dipisahkan daripada peserta unik. Definisi operasi sebenar masih memerlukan pengesahan.',
    });
    action.status = 'review';
    action.revision++;
  }
  if (action.status === 'review')
    await updateAction(actor('executive'), action.id, {
      status: 'closed',
      revision: action.revision,
    });

  for (const [geography, publish] of [
    ['MY-01', true],
    ['MY-10', false],
  ] as const) {
    let row = (await getSubmissions(actor('steward'))).find(
      (s) => s.geography === geography && s.period === '2026-08-02',
    );
    if (!row) {
      const target = await createUploadTarget(actor('contributor'), {
        template: 'aggregate',
        teras: 2,
        geography,
        period: '2026-08-02',
        format: 'csv',
        synthetic: true,
      });
      const csv = `schema_version,classification,source_key,organisation,geography,period,indicator_code,unit,value,state,denominator\n1.0,DEMO / SYNTHETIC,curated-${geography},demo-a,${geography},2026-08-02,D-BURDEN,rekod,12000,value,100000\n`;
      await acceptUpload(actor('contributor'), target.id, target.token, Buffer.from(csv));
      // The demo worker may already own the job; await this submission's actual validation.
      await runNode([
        'node_modules/tsx/dist/cli.mjs',
        '--conditions=react-server',
        'src/worker/run.ts',
        '--once',
      ]);
      for (let i = 0; i < 70; i++) {
        row = (await getSubmissions(actor('steward'))).find((s) => s.id === target.id);
        if (row && !['quarantined', 'validating'].includes(row.state)) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (!row || row.state === 'invalid') throw new Error('Curated submission validation failed.');
    if (publish) {
      for (const [state, role, operation] of [
        ['validated', 'steward', 'submit'],
        ['submitted', 'reviewer', 'approve'],
        ['approved', 'secretariat', 'publish'],
      ] as const) {
        if (row.state === state) {
          await changeSubmission(actor(role), row.id, {
            operation,
            revision: row.revision,
            reason:
              'Semakan bebas senario demonstrasi; sumber, liputan dan kualiti rekaan disahkan.',
            attestation: true,
          });
          row = (await getSubmissions(actor('steward'))).find((s) => s.id === row!.id)!;
        }
      }
    }
  }
  if (
    !(await getSavedReports(actor('analyst'))).some(
      (v) => v.title === 'Semakan kebangsaan · 9 Ogos 2026',
    )
  ) {
    await saveReport(actor('analyst'), {
      title: 'Semakan kebangsaan · 9 Ogos 2026',
      filters: defaultFilters,
    });
  }
  console.log(
    'Curated demo: four actions (one independently closed), two notes/decisions, two scanned submissions (one published), one saved report. All demonstration data.',
  );
} finally {
  await admin.end();
  await (globalThis as unknown as { dashboardPool?: pg.Pool }).dashboardPool?.end();
}
