import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { withScope, audit } from './db';
import { requirePermission } from './auth';
import { allowed, type Session, type Resource, type WorkflowState } from '../domain/policy';
import { transitionSubmission, type TransitionInput } from '../domain/workflow';
import { templates, type UploadRow, type Issue } from '../domain/uploads';
import { disclose } from '../domain/semantics';
import { writePrivate } from './private-storage';
import { BOUNDARY } from '../domain/types';
const targetSchema = z
  .object({
    template: z.string().max(40),
    teras: z.number().int().min(1).max(5),
    geography: z.string().regex(/^(MY|MY-(0[1-9]|1[0-6]))$/),
    period: z.enum(['2026-08-09', '2026-08-02']),
    format: z.enum(['csv', 'xlsx']),
    synthetic: z.literal(true),
    predecessor: z.string().max(100).optional(),
    revisionReason: z.string().trim().max(500).optional(),
  })
  .strict();
type Validation = { errors: Issue[]; warnings: Issue[]; rows: UploadRow[]; checkedAt?: string };
interface SubmissionRow {
  id: string;
  organisation: string;
  geography: string;
  teras: number;
  sensitivity: 'demo';
  period: string;
  template: string;
  schema_version: string;
  state: WorkflowState;
  submitter: string;
  reviewer: string | null;
  publisher: string | null;
  filename: string;
  checksum: string | null;
  storage_key: string;
  scan_status: string;
  attestation: Record<string, unknown> | null;
  review_reason: string | null;
  revision_reason: string | null;
  predecessor: string | null;
  validation: Partial<Validation>;
  revision: number;
  created_at: Date;
  updated_at: Date;
  format: 'csv' | 'xlsx';
  upload_expires: Date;
  publication_id: string | null;
}
export interface PreviewRow {
  code: string;
  geography: string;
  value: number | null;
  state: string;
  unit: string;
  denominator: number | null;
}
export interface SubmissionDTO {
  id: string;
  template: string;
  period: string;
  geography: string;
  teras: number;
  organisation: string;
  state: WorkflowState;
  scanStatus: string;
  revision: number;
  submitter: string;
  reviewer: string | null;
  publication: string | null;
  predecessor: string | null;
  createdAt: string;
  updatedAt: string;
  errors: Issue[];
  warnings: Issue[];
  preview: PreviewRow[];
  rows: number;
  canSubmit: boolean;
  canApprove: boolean;
  canPublish: boolean;
  reason: string | null;
  attested: boolean;
}
function token(id: string, actor: string, expires: number) {
  if (!process.env.SESSION_SECRET) throw new Error('Sesi belum dikonfigurasi.');
  return createHmac('sha256', process.env.SESSION_SECRET)
    .update(`${id}:${actor}:${expires}`)
    .digest('hex');
}
function resource(row: SubmissionRow): Resource {
  return {
    organisation: row.organisation,
    geography: row.geography,
    teras: row.teras,
    sensitivity: 'demo',
    state: row.state,
    submitter: row.submitter,
  };
}
export function disclosedPreview(rows: UploadRow[]): PreviewRow[] {
  const protectedValues = new Map<string, (number | null)[]>();
  for (const code of new Set(rows.map((r) => r.indicatorCode)))
    protectedValues.set(
      code,
      disclose(
        rows.filter((r) => r.indicatorCode === code).map((r) => r.value),
        5,
      ),
    );
  const indices = new Map<string, number>();
  return rows.map((row) => {
    const i = indices.get(row.indicatorCode) ?? 0;
    indices.set(row.indicatorCode, i + 1);
    const value = protectedValues.get(row.indicatorCode)![i],
      hidden = row.value !== null && value === null;
    return {
      code: row.indicatorCode,
      geography: row.geography,
      value,
      state: hidden ? 'suppressed' : row.state,
      unit: row.unit,
      denominator: hidden ? null : row.denominator,
    };
  });
}
export async function createUploadTarget(session: Session, input: unknown) {
  const data = targetSchema.parse(input),
    template = templates.find((t) => t.id === data.template);
  if (!template || (template.teras !== null && template.teras !== data.teras))
    throw new Error('Templat tidak sepadan dengan Teras.');
  const organisation = session.organisation === '*' ? 'demo-a' : session.organisation;
  const scope = {
    organisation,
    geography: data.geography,
    teras: data.teras,
    sensitivity: 'demo' as const,
    state: 'draft' as const,
  };
  requirePermission(session, 'upload', scope);
  const id = crypto.randomUUID(),
    expires = Date.now() + 10 * 60 * 1000;
  await withScope(session, async (c) => {
    if (data.predecessor) {
      const result = await c.query(
        'SELECT id,organisation,geography,teras,period::text,origin FROM core.publication WHERE id=$1',
        [data.predecessor],
      );
      const old = result.rows[0];
      if (
        !old ||
        old.origin !== 'synthetic' ||
        old.organisation !== organisation ||
        old.geography !== data.geography ||
        old.teras !== data.teras ||
        old.period !== data.period
      )
        throw new Error('Versi terdahulu tidak sepadan dengan skop.');
      requirePermission(session, 'view', { ...scope, state: 'published' });
      if (!data.revisionReason || data.revisionReason.length < 3)
        throw new Error('Sebab semakan diperlukan.');
    }
    await c.query(
      "INSERT INTO core.submission(id,organisation,geography,teras,period,template,schema_version,state,submitter,filename,storage_key,format,upload_expires,predecessor,revision_reason) VALUES($1,$2,$3,$4,$5,$6,'1.0','draft',$7,$8,$1,$9,$10,$11,$12)",
      [
        id,
        organisation,
        data.geography,
        data.teras,
        data.period,
        data.template,
        session.id,
        `demo-${id}.${data.format}`,
        data.format,
        new Date(expires),
        data.predecessor ?? null,
        data.revisionReason ?? null,
      ],
    );
    await audit(c, session, 'upload-target', id, 'Sasaran demo berjangka 10 minit dicipta.');
  });
  return { id, url: `/api/v1/uploads/${id}/file`, token: token(id, session.id, expires), expires };
}
export async function acceptUpload(
  session: Session,
  id: string,
  uploadToken: string,
  bytes: Buffer,
) {
  return withScope(session, async (c) => {
    const result = await c.query<SubmissionRow>(
        'SELECT *,period::text FROM core.submission WHERE id=$1 FOR UPDATE',
        [id],
      ),
      row = result.rows[0];
    if (!row) throw new Error('Objek tidak tersedia.');
    requirePermission(session, 'upload', resource(row));
    const expected = token(id, session.id, new Date(row.upload_expires).getTime());
    if (
      row.state !== 'draft' ||
      row.submitter !== session.id ||
      new Date(row.upload_expires).getTime() < Date.now() ||
      uploadToken.length !== expected.length ||
      !timingSafeEqual(Buffer.from(uploadToken), Buffer.from(expected))
    )
      throw new Error('Sasaran tamat, digunakan atau tidak dibenarkan.');
    if (bytes.length > 2 * 1024 * 1024 || !bytes.length)
      throw new Error('Had fail 1 bait hingga 2 MB.');
    const checksum = createHash('sha256').update(bytes).digest('hex');
    const duplicate = await c.query(
      "SELECT id FROM core.submission WHERE organisation=$1 AND checksum=$2 AND COALESCE(predecessor,'')=COALESCE($3,'')",
      [row.organisation, checksum, row.predecessor],
    );
    if (duplicate.rowCount) throw new Error('Fail pendua: gunakan rekod penyerahan sedia ada.');
    await writePrivate(id, bytes);
    await c.query(
      "UPDATE core.submission SET checksum=$2,state='quarantined',uploaded_by=$3,revision=revision+1,updated_at=now() WHERE id=$1",
      [id, checksum, session.id],
    );
    await c.query("INSERT INTO core.job(id,submission_id,kind) VALUES($1,$2,'validate')", [
      crypto.randomUUID(),
      id,
    ]);
    await audit(
      c,
      session,
      'upload-quarantine',
      id,
      'Fail demo disimpan dengan AES-256-GCM; menunggu imbasan pekerja.',
    );
    return { id, state: 'quarantined' };
  });
}
export async function getSubmissions(session: Session): Promise<SubmissionDTO[]> {
  return withScope(session, async (c) => {
    const result = await c.query<SubmissionRow>(
      'SELECT *,period::text FROM core.submission ORDER BY created_at DESC LIMIT 100',
    );
    return result.rows
      .filter((row) => allowed(session, 'view', resource(row)))
      .map((row) => ({
        id: row.id,
        template: row.template,
        period: row.period,
        geography: row.geography,
        teras: row.teras,
        organisation: row.organisation,
        state: row.state,
        scanStatus: row.scan_status,
        revision: row.revision,
        submitter: row.submitter,
        reviewer: row.reviewer,
        publication: row.publication_id,
        predecessor: row.predecessor,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        errors: row.validation.errors ?? [],
        warnings: row.validation.warnings ?? [],
        preview: disclosedPreview(row.validation.rows ?? []).slice(0, 20),
        rows: row.validation.rows?.length ?? 0,
        canSubmit: allowed(session, 'submit', resource(row)),
        canApprove: allowed(session, 'approve', resource(row)),
        canPublish: allowed(session, 'publish', resource(row)),
        reason: row.review_reason ?? row.revision_reason,
        attested: !!row.attestation,
      }));
  });
}
const transitionSchema = z
  .object({
    operation: z.enum(['submit', 'approve', 'reject', 'publish']),
    revision: z.number().int().positive(),
    reason: z.string().trim().min(3).max(500),
    attestation: z.boolean().optional(),
  })
  .strict();
export async function changeSubmission(session: Session, id: string, input: unknown) {
  const data: TransitionInput = transitionSchema.parse(input);
  return withScope(session, async (c) => {
    const result = await c.query<SubmissionRow>(
        'SELECT *,period::text FROM core.submission WHERE id=$1 FOR UPDATE',
        [id],
      ),
      row = result.rows[0];
    if (!row) throw new Error('Objek tidak tersedia.');
    const next = transitionSubmission(
      session,
      {
        ...resource(row),
        revision: row.revision,
        scanStatus: row.scan_status,
        errors: row.validation.errors?.length ?? 1,
        warnings: row.validation.warnings?.length ?? 0,
      },
      data,
    );
    if (next === 'submitted') {
      await c.query(
        "UPDATE core.submission SET state='submitted',submitter=$2,attestation=$3,revision=revision+1,updated_at=now() WHERE id=$1",
        [
          id,
          session.id,
          JSON.stringify({
            source: true,
            coverage: true,
            quality: true,
            synthetic: true,
            by: session.id,
            at: new Date().toISOString(),
            reason: data.reason,
          }),
        ],
      );
    } else if (next === 'approved' || next === 'rejected') {
      await c.query(
        'UPDATE core.submission SET state=$2,reviewer=$3,review_reason=$4,revision=revision+1,updated_at=now() WHERE id=$1',
        [id, next, session.id, data.reason],
      );
    } else {
      const rows = row.validation.rows ?? [];
      if (!rows.length || row.scan_status !== 'clean' || (row.validation.errors?.length ?? 1) > 0)
        throw new Error('Penyerahan tidak sah untuk penerbitan.');
      let version = 1;
      if (row.predecessor) {
        const prior = await c.query('SELECT version FROM core.publication WHERE id=$1', [
          row.predecessor,
        ]);
        version = prior.rows[0].version + 1;
        const newer = await c.query('SELECT id FROM core.publication WHERE predecessor=$1', [
          row.predecessor,
        ]);
        if (newer.rowCount)
          throw new Error('Versi terdahulu telah disemak; mulakan daripada versi terkini.');
      }
      const publication = crypto.randomUUID();
      await c.query(
        "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,submission_id,predecessor,reason,created_by) VALUES($1,$2,$3,$4,'synthetic',false,$5,'v1',$6,$7,$8,$9,$10)",
        [
          publication,
          row.organisation,
          row.geography,
          row.teras,
          version,
          row.period,
          id,
          row.predecessor,
          row.revision_reason ?? data.reason,
          session.id,
        ],
      );
      for (const value of rows)
        await c.query(
          "INSERT INTO demo.observation(id,code,definition_version,publication_id,organisation,geography,teras,period,value,state,denominator,unit,boundary_version,source,source_key,metadata) VALUES($1,$2,'v1',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Penyerahan diluluskan · DEMO / SYNTHETIC',$13,$14)",
          [
            crypto.randomUUID(),
            value.indicatorCode,
            publication,
            row.organisation,
            value.geography,
            row.teras,
            row.period,
            value.value,
            value.state,
            value.denominator,
            value.unit,
            BOUNDARY,
            value.sourceKey,
            JSON.stringify({
              origin: 'synthetic',
              refreshed: new Date().toISOString(),
              coverage: 100,
              denominatorSource: 'Penyebut rekaan daripada fail disahkan · DEMO / SYNTHETIC',
              submission: id,
              drivers: [{ label: 'Rekod demo diterbitkan', value: value.value, unit: value.unit }],
            }),
          ],
        );
      await c.query(
        "UPDATE core.submission SET state='published',publisher=$2,publication_id=$3,revision=revision+1,updated_at=now() WHERE id=$1",
        [id, session.id, publication],
      );
    }
    await audit(
      c,
      session,
      `submission-${data.operation}`,
      id,
      `Peralihan ${row.state} → ${next}; alasan tersimpan dalam rekod terkawal.`,
    );
    return { id, state: next };
  });
}
export async function retryValidation(session: Session, id: string) {
  return withScope(session, async (c) => {
    const result = await c.query<SubmissionRow>(
        'SELECT *,period::text FROM core.submission WHERE id=$1 FOR UPDATE',
        [id],
      ),
      row = result.rows[0];
    if (!row) throw new Error('Objek tidak tersedia.');
    requirePermission(session, 'upload', resource(row));
    if (row.state !== 'invalid' || row.scan_status === 'blocked')
      throw new Error(
        'Penilaian semula tidak tersedia. Betulkan fail dan cipta penyerahan baharu.',
      );
    await c.query(
      "UPDATE core.job SET state='pending',attempts=0,error_code=NULL,locked_at=NULL WHERE submission_id=$1 AND kind='validate'",
      [id],
    );
    await c.query(
      "UPDATE core.submission SET state='quarantined',scan_status='pending',revision=revision+1,updated_at=now() WHERE id=$1",
      [id],
    );
    await audit(
      c,
      session,
      'validation-retry',
      id,
      'Cuba semula selepas kegagalan infrastruktur; fail asal tidak diubah.',
    );
    return { id, state: 'quarantined' };
  });
}
