import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import ExcelJS from 'exceljs';
import { allowed, type Resource, type Session } from '../domain/policy';
import { parseFilters, type Filters } from '../domain/filters';
import { csvCell } from '../domain/semantics';
import type { MapZoneDTO, MetricDTO } from '../domain/types';
import { getMapZones, getMetrics } from './dal';
import { audit, withScope } from './db';
import { readPrivate, writePrivate } from './private-storage';

const SNAPSHOT_SCHEMA = 'saved-report-v1' as const;
const DEMO = 'DEMO / SYNTHETIC';
const SUPPLIED = 'Petikan sumber dibekalkan';
const CAVEATS = [
  'Nilai 1–4 dan sel pelengkap disekat mengikut peraturan demo v1.',
  'Aduan ialah isyarat; tangkapan tidak membuktikan kesalahan atau prevalens.',
  'Kiraan klien bukan ukuran pemulihan berkekalan dan status berulang bukan relaps.',
  'Data demonstrasi tidak membuktikan sebab-akibat dan tidak boleh diterbitkan sebagai data rasmi.',
] as const;

interface FrozenMetric extends MetricDTO {
  access: Resource;
}
interface FrozenZone extends MapZoneDTO {
  access: Resource;
}
interface SavedContext {
  schema: typeof SNAPSHOT_SCHEMA;
  title: string;
  filters: Filters;
  generatedAt: string;
  classification: string;
  versions: {
    publications: string[];
    definitions: string[];
    boundaries: string[];
  };
  caveats: string[];
  supplied: FrozenMetric[];
  synthetic: FrozenZone[];
}
interface ExportContext {
  schema: 'report-export-v1';
  savedViewId: string;
  format: 'csv' | 'xlsx';
  filename: string;
  contentType: string;
  resources: Resource[];
}
export interface SavedReportDTO {
  id: string;
  title: string;
  createdAt: string;
  generatedAt: string;
  classification: string;
  filters: Filters;
  suppliedRows: number;
  syntheticRows: number;
  publications: string[];
  definitions: string[];
  boundaries: string[];
}
export interface ReportExportDTO {
  id: string;
  savedViewId: string;
  format: 'csv' | 'xlsx';
  createdAt: string;
  expiresAt: string;
  classification: string;
  downloadUrl: string;
}

const resourceStates = new Set(['published']);
const sensitivities = new Set(['public-aggregate', 'demo', 'restricted']);
function isResource(value: unknown): value is Resource {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.organisation === 'string' &&
    typeof row.geography === 'string' &&
    Number.isInteger(row.teras) &&
    sensitivities.has(String(row.sensitivity)) &&
    resourceStates.has(String(row.state))
  );
}
function parseSavedContext(value: unknown): SavedContext {
  if (!value || typeof value !== 'object')
    throw new Error('Akses ditolak untuk paparan tersimpan.');
  const context = value as Partial<SavedContext>;
  if (
    context.schema !== SNAPSHOT_SCHEMA ||
    typeof context.title !== 'string' ||
    typeof context.generatedAt !== 'string' ||
    typeof context.classification !== 'string' ||
    !context.filters ||
    !context.versions ||
    !Array.isArray(context.caveats) ||
    !Array.isArray(context.supplied) ||
    !Array.isArray(context.synthetic) ||
    context.supplied.length > 14 ||
    context.synthetic.length > 16 ||
    context.supplied.length + context.synthetic.length > 32 ||
    !context.supplied.every((row) => isResource(row.access)) ||
    !context.synthetic.every((row) => isResource(row.access))
  )
    throw new Error('Akses ditolak untuk versi paparan yang tidak dikenali.');
  return context as SavedContext;
}
function parseExportContext(value: unknown): ExportContext {
  if (!value || typeof value !== 'object') throw new Error('Akses ditolak untuk eksport.');
  const context = value as Partial<ExportContext>;
  if (
    context.schema !== 'report-export-v1' ||
    typeof context.savedViewId !== 'string' ||
    !['csv', 'xlsx'].includes(context.format ?? '') ||
    typeof context.filename !== 'string' ||
    typeof context.contentType !== 'string' ||
    !Array.isArray(context.resources) ||
    context.resources.length > 32 ||
    !context.resources.every(isResource)
  )
    throw new Error('Akses ditolak untuk versi eksport yang tidak dikenali.');
  return context as ExportContext;
}
function resources(context: SavedContext): Resource[] {
  return [
    ...context.supplied.map((row) => row.access),
    ...context.synthetic.map((row) => row.access),
  ];
}
function authorise(session: Session, permission: 'view' | 'export', items: Resource[]) {
  if (!items.length || !items.every((resource) => allowed(session, permission, resource)))
    throw new Error('Akses ditolak untuk skop atau klasifikasi laporan ini.');
}
function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}
function cleanTitle(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Akses ditolak: tajuk laporan diperlukan.');
  const title = value.trim();
  if (title.length < 3 || title.length > 100 || /[\u0000-\u001f]/.test(title))
    throw new Error('Akses ditolak: tajuk laporan tidak sah.');
  return title;
}
function dto(id: string, createdAt: string, context: SavedContext): SavedReportDTO {
  return {
    id,
    title: context.title,
    createdAt,
    generatedAt: context.generatedAt,
    classification: context.classification,
    filters: context.filters,
    suppliedRows: context.supplied.length,
    syntheticRows: context.synthetic.length,
    publications: context.versions.publications,
    definitions: context.versions.definitions,
    boundaries: context.versions.boundaries,
  };
}
function exportDTO(row: Record<string, unknown>, context: ExportContext): ReportExportDTO {
  return {
    id: String(row.id),
    savedViewId: context.savedViewId,
    format: context.format,
    createdAt: String(row.created_at),
    expiresAt: String(row.expires_at),
    classification: String(row.classification),
    downloadUrl: `/api/v1/reports/exports/${String(row.id)}`,
  };
}

function normaliseFilters(value: unknown): Filters {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Akses ditolak: penapis laporan tidak sah.');
  return parseFilters(value as Record<string, string | string[] | undefined>);
}

async function captureSnapshot(
  session: Session,
  title: string,
  filters: Filters,
): Promise<SavedContext> {
  const [metrics, zones] = await Promise.all([
    getMetrics(session, filters),
    getMapZones(session, filters),
  ]);
  if (metrics.length > 14 || zones.length > 16 || metrics.length + zones.length > 32)
    throw new Error('Akses ditolak: laporan besar tidak tersedia dalam V1.');
  const publications = unique(zones.map((row) => row.publication));
  const descriptors = publications.length
    ? await withScope(session, async (client) => {
        const result = await client.query(
          'SELECT publication_id,geography,organisation,teras,code FROM demo.observation WHERE publication_id=ANY($1::text[])',
          [publications],
        );
        return result.rows as {
          publication_id: string;
          geography: string;
          organisation: string;
          teras: number;
          code: string;
        }[];
      })
    : [];
  const synthetic = zones.map((zone) => {
    const descriptor = descriptors.find(
      (row) =>
        row.publication_id === zone.publication &&
        row.geography === zone.id &&
        row.code === `D-${zone.layer === 'supply' ? 'SUPPLY' : zone.layer.toUpperCase()}`,
    );
    if (!descriptor) throw new Error('Akses ditolak: sumber penerbitan laporan tidak ditemui.');
    return {
      ...zone,
      access: {
        organisation: descriptor.organisation,
        geography: descriptor.geography,
        teras: descriptor.teras,
        sensitivity: 'demo' as const,
        state: 'published' as const,
      },
    };
  });
  const supplied = metrics.map((metric) => ({
    ...metric,
    access: {
      organisation: 'shared',
      geography: 'MY',
      teras: metric.definition.teras,
      sensitivity: 'public-aggregate' as const,
      state: 'published' as const,
    },
  }));
  const allResources = [
    ...supplied.map((row) => row.access),
    ...synthetic.map((row) => row.access),
  ];
  authorise(session, 'view', allResources);
  const classification =
    supplied.length && synthetic.length
      ? `${SUPPLIED} + ${DEMO}`
      : synthetic.length
        ? DEMO
        : SUPPLIED;
  return {
    schema: SNAPSHOT_SCHEMA,
    title,
    filters,
    generatedAt: new Date().toISOString(),
    classification,
    versions: {
      publications: unique([
        ...supplied.map((row) => row.publication),
        ...synthetic.map((row) => row.publication),
      ]),
      definitions: unique([
        ...supplied.map((row) => row.definition.version),
        ...synthetic.map((row) => row.definition),
      ]),
      boundaries: unique(synthetic.map((row) => row.boundary)),
    },
    caveats: [...CAVEATS],
    supplied,
    synthetic,
  };
}

export async function saveReport(
  session: Session,
  input: { title?: unknown; filters?: unknown },
): Promise<SavedReportDTO> {
  const title = cleanTitle(input.title);
  const context = await captureSnapshot(session, title, normaliseFilters(input.filters));
  const id = randomUUID();
  return withScope(session, async (client) => {
    const result = await client.query(
      'INSERT INTO core.saved_view(id,title,actor,organisation,context) VALUES($1,$2,$3,$4,$5) RETURNING created_at::text',
      [id, title, session.id, session.organisation, context],
    );
    await audit(
      client,
      session,
      'saved-view-created',
      id,
      'Paparan DTO terdedah dibekukan bersama versi penerbitan dan definisi.',
    );
    return dto(id, result.rows[0].created_at, context);
  });
}

export async function getSavedReports(session: Session): Promise<SavedReportDTO[]> {
  return withScope(session, async (client) => {
    const result = await client.query(
      'SELECT id,created_at::text,context FROM core.saved_view WHERE actor=$1 ORDER BY created_at DESC LIMIT 50',
      [session.id],
    );
    return result.rows.flatMap((row) => {
      try {
        const context = parseSavedContext(row.context);
        authorise(session, 'view', resources(context));
        return [dto(row.id, row.created_at, context)];
      } catch {
        return [];
      }
    });
  });
}

async function savedForExport(session: Session, id: string): Promise<SavedContext> {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Akses ditolak untuk paparan tersimpan.');
  return withScope(session, async (client) => {
    const result = await client.query(
      'SELECT context FROM core.saved_view WHERE id=$1 AND actor=$2 LIMIT 1',
      [id, session.id],
    );
    if (!result.rowCount) throw new Error('Akses ditolak untuk paparan tersimpan.');
    const context = parseSavedContext(result.rows[0].context);
    authorise(session, 'export', resources(context));
    return context;
  });
}

const spreadsheetString = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? `'${text}` : text;
};
function metadataRows(context: SavedContext): [string, string][] {
  return [
    ['title', context.title],
    ['filters', JSON.stringify(context.filters)],
    ['period', context.filters.period],
    ['generated_at', context.generatedAt],
    ['classification', context.classification],
    ['publication_version', context.versions.publications.join(' | ')],
    ['definition_version', context.versions.definitions.join(' | ')],
    ['boundary_version', context.versions.boundaries.join(' | ')],
    ['caveats', context.caveats.join(' | ')],
  ];
}
function csvBytes(context: SavedContext): Buffer {
  const lines = metadataRows(context).map((row) => row.map(csvCell).join(','));
  lines.push('', csvCell(SUPPLIED));
  lines.push(
    [
      'indicator_code',
      'name',
      'value',
      'state',
      'unit',
      'period',
      'publication_version',
      'definition_version',
      'source',
    ].join(','),
  );
  for (const row of context.supplied)
    lines.push(
      [
        row.definition.code,
        row.definition.name,
        row.value,
        row.state,
        row.definition.unit,
        row.period,
        row.publication,
        row.definition.version,
        row.definition.source,
      ]
        .map(csvCell)
        .join(','),
    );
  lines.push('', csvCell(DEMO));
  lines.push(
    [
      'geography',
      'name',
      'layer',
      'count',
      'denominator',
      'rate',
      'state',
      'period',
      'publication_version',
      'definition_version',
      'boundary_version',
      'source',
      'confidence',
      'coverage',
    ].join(','),
  );
  for (const row of context.synthetic)
    lines.push(
      [
        row.id,
        row.name,
        row.layer,
        row.count,
        row.denominator,
        row.rate,
        row.state,
        row.period,
        row.publication,
        row.definition,
        row.boundary,
        row.source,
        row.confidence,
        row.coverage,
      ]
        .map(csvCell)
        .join(','),
    );
  return Buffer.from(`\ufeff${lines.join('\r\n')}\r\n`, 'utf8');
}
async function xlsxBytes(context: SavedContext): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DDN Malaysia V1';
  workbook.created = new Date(context.generatedAt);
  const meta = workbook.addWorksheet('Metadata');
  meta.addRows(metadataRows(context).map((row) => row.map(spreadsheetString)));
  const supplied = workbook.addWorksheet('Supplied source');
  supplied.addRow([
    'indicator_code',
    'name',
    'value',
    'state',
    'unit',
    'period',
    'publication_version',
    'definition_version',
    'source',
  ]);
  context.supplied.forEach((row) =>
    supplied.addRow(
      [
        row.definition.code,
        row.definition.name,
        row.value,
        row.state,
        row.definition.unit,
        row.period,
        row.publication,
        row.definition.version,
        row.definition.source,
      ].map(spreadsheetString),
    ),
  );
  const synthetic = workbook.addWorksheet('DEMO SYNTHETIC');
  synthetic.addRow([DEMO]);
  synthetic.addRow([
    'geography',
    'name',
    'layer',
    'count',
    'denominator',
    'rate',
    'state',
    'period',
    'publication_version',
    'definition_version',
    'boundary_version',
    'source',
    'confidence',
    'coverage',
  ]);
  context.synthetic.forEach((row) =>
    synthetic.addRow(
      [
        row.id,
        row.name,
        row.layer,
        row.count,
        row.denominator,
        row.rate,
        row.state,
        row.period,
        row.publication,
        row.definition,
        row.boundary,
        row.source,
        row.confidence,
        row.coverage,
      ].map(spreadsheetString),
    ),
  );
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function generateReportExport(
  session: Session,
  savedViewId: string,
  input: { format?: unknown },
): Promise<ReportExportDTO> {
  if (input.format !== 'csv' && input.format !== 'xlsx')
    throw new Error('Akses ditolak: format eksport tidak sah.');
  const context = await savedForExport(session, savedViewId);
  const bytes = input.format === 'csv' ? csvBytes(context) : await xlsxBytes(context);
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const filename = `ddn-report-${id}.${input.format}`;
  const exportContext: ExportContext = {
    schema: 'report-export-v1',
    savedViewId,
    format: input.format,
    filename,
    contentType:
      input.format === 'csv'
        ? 'text/csv; charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    resources: resources(context),
  };
  await writePrivate(id, bytes);
  return withScope(session, async (client) => {
    const result = await client.query(
      'INSERT INTO core.export(id,actor,organisation,context,checksum,expires_at,classification) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING created_at::text,expires_at::text',
      [
        id,
        session.id,
        session.organisation,
        exportContext,
        createHash('sha256').update(bytes).digest('hex'),
        expiresAt,
        context.classification,
      ],
    );
    await audit(
      client,
      session,
      'report-export-generated',
      id,
      'Eksport agregat kecil dijana daripada paparan terdedah yang dibekukan.',
    );
    return exportDTO(
      { id, ...result.rows[0], classification: context.classification },
      exportContext,
    );
  });
}

export async function getReportExports(session: Session): Promise<ReportExportDTO[]> {
  return withScope(session, async (client) => {
    const result = await client.query(
      'SELECT id,context,classification,created_at::text,expires_at::text FROM core.export WHERE actor=$1 ORDER BY created_at DESC LIMIT 50',
      [session.id],
    );
    return result.rows.flatMap((row) => {
      try {
        const context = parseExportContext(row.context);
        authorise(session, 'export', context.resources);
        return [exportDTO(row, context)];
      } catch {
        return [];
      }
    });
  });
}

export async function downloadReportExport(
  session: Session,
  id: string,
): Promise<{ bytes: Buffer; filename: string; contentType: string }> {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Akses ditolak untuk eksport.');
  const context = await withScope(session, async (client) => {
    const result = await client.query(
      'SELECT context FROM core.export WHERE id=$1 AND actor=$2 AND expires_at>now() LIMIT 1',
      [id, session.id],
    );
    if (!result.rowCount) throw new Error('Akses ditolak untuk eksport tamat atau tidak tersedia.');
    const parsed = parseExportContext(result.rows[0].context);
    authorise(session, 'export', parsed.resources);
    await audit(
      client,
      session,
      'report-export-downloaded',
      id,
      'Kebenaran, skop dan tempoh eksport disahkan semula.',
    );
    return parsed;
  });
  return {
    bytes: await readPrivate(id),
    filename: context.filename,
    contentType: context.contentType,
  };
}

export { normaliseFilters };
