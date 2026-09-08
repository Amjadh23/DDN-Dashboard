import { csvCell } from './semantics';
import { definitionByCode, metricDefinitions } from './registry';
import { DEMO_LABEL, type DataState } from './types';

export const uploadColumns = [
  'schema_version',
  'classification',
  'source_key',
  'organisation',
  'geography',
  'period',
  'indicator_code',
  'unit',
  'value',
  'state',
  'denominator',
] as const;

export type UploadColumn = (typeof uploadColumns)[number];
export type TemplateId =
  | 'aggregate'
  | 'prevention'
  | 'treatment'
  | 'enforcement'
  | 'harm'
  | 'international'
  | 'capacity'
  | 'population';

export interface UploadTemplate {
  id: TemplateId;
  name: string;
  teras: number | null;
  code: string;
  description: string;
  version: '1.0';
}

export interface UploadRow {
  schemaVersion: '1.0';
  classification: typeof DEMO_LABEL;
  sourceKey: string;
  organisation: string;
  geography: string;
  period: string;
  indicatorCode: string;
  unit: string;
  value: number | null;
  state: DataState;
  denominator: number | null;
}

export interface Issue {
  row: number;
  column: string;
  code: string;
  message: string;
}

export interface ExpectedUploadScope {
  template: string;
  teras: number;
  geography: string;
  period: string;
  organisation: string;
}

export type ExampleScope = Omit<ExpectedUploadScope, 'template'>;

export interface UploadDictionaryEntry {
  column: UploadColumn;
  required: boolean;
  instruction: string;
  allowed: string;
}

const version = '1.0' as const;
export const templates: UploadTemplate[] = [
  {
    id: 'aggregate',
    name: 'Agregat mengikut Teras',
    teras: null,
    code: 'D-*',
    description: 'Satu indikator demonstrasi berdaftar bagi Teras yang dipilih.',
    version,
  },
  {
    id: 'prevention',
    name: 'Pendidikan pencegahan',
    teras: 1,
    code: 'D-T1-REACH',
    description: 'Kehadiran program pencegahan agregat rekaan.',
    version,
  },
  {
    id: 'treatment',
    name: 'Rawatan dan pemulihan',
    teras: 2,
    code: 'D-T2-FOLLOWUP',
    description: 'Susulan rawatan agregat rekaan.',
    version,
  },
  {
    id: 'enforcement',
    name: 'Penguatkuasaan',
    teras: 3,
    code: 'D-T3-OPERATIONS',
    description: 'Operasi penguatkuasaan agregat rekaan.',
    version,
  },
  {
    id: 'harm',
    name: 'Pengurangan kemudaratan',
    teras: 4,
    code: 'D-T4-SCREENING',
    description: 'Saringan kemudaratan agregat rekaan.',
    version,
  },
  {
    id: 'international',
    name: 'Kerjasama antarabangsa',
    teras: 5,
    code: 'D-T5-COMMITMENTS',
    description: 'Komitmen kerjasama agregat rekaan.',
    version,
  },
  {
    id: 'capacity',
    name: 'Kapasiti perkhidmatan',
    teras: 2,
    code: 'D-CAPACITY',
    description: 'Kapasiti perkhidmatan agregat rekaan.',
    version,
  },
  {
    id: 'population',
    name: 'Populasi demo',
    teras: 1,
    code: 'D-POPULATION',
    description: 'Penyebut populasi rekaan; bukan anggaran rasmi.',
    version,
  },
];

export const uploadDictionary: UploadDictionaryEntry[] = [
  {
    column: 'schema_version',
    required: true,
    instruction: 'Gunakan versi kontrak tepat.',
    allowed: '1.0',
  },
  {
    column: 'classification',
    required: true,
    instruction: 'Semua muat naik V1 ialah data demo.',
    allowed: DEMO_LABEL,
  },
  {
    column: 'source_key',
    required: true,
    instruction: 'ID unik stabil tanpa formula atau maklumat peribadi.',
    allowed: '1–128 aksara: huruf, nombor, titik, garis, kolon',
  },
  {
    column: 'organisation',
    required: true,
    instruction: 'Mesti sepadan dengan skop organisasi yang diluluskan.',
    allowed: 'Skop muat naik',
  },
  {
    column: 'geography',
    required: true,
    instruction: 'Mesti sepadan dengan kod geografi agregat yang diluluskan.',
    allowed: 'Skop muat naik',
  },
  {
    column: 'period',
    required: true,
    instruction: 'Tarikh kalendar ISO dan mesti sepadan dengan tempoh skop.',
    allowed: 'YYYY-MM-DD',
  },
  {
    column: 'indicator_code',
    required: true,
    instruction: 'Kod D-* sintetik berdaftar untuk templat dan Teras.',
    allowed: 'Daftar indikator demo',
  },
  {
    column: 'unit',
    required: true,
    instruction: 'Mesti sama dengan unit definisi indikator.',
    allowed: 'Unit daftar indikator',
  },
  {
    column: 'value',
    required: false,
    instruction: 'Nombor bukan negatif apabila state=value; kosong untuk state lain.',
    allowed: 'Nombor atau kosong',
  },
  {
    column: 'state',
    required: true,
    instruction:
      'Bezakan nilai, sifar, tidak diketahui, tidak dikumpul, tidak berkenaan dan disekat.',
    allowed: 'value | unknown | not-collected | not-applicable | suppressed',
  },
  {
    column: 'denominator',
    required: false,
    instruction:
      'Penyebut mesti lebih daripada sifar; kosong jika tidak berkenaan atau state bukan value.',
    allowed: 'Nombor positif atau kosong',
  },
];

const states = new Set<DataState>([
  'value',
  'unknown',
  'not-collected',
  'not-applicable',
  'suppressed',
]);
const dangerous = /^[\s\u0000-\u001f]*[=+\-@]/;
const safeIdentifier = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const columnSet = new Set<string>(uploadColumns);
const templateById = new Map(templates.map((template) => [template.id, template]));

function issue(row: number, column: string, code: string, message: string): Issue {
  return { row, column, code, message };
}

function textValue(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

function numericValue(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function allowedIndicator(templateId: string, teras: number, code: string): boolean {
  const template = templateById.get(templateId as TemplateId);
  if (!template || (template.teras !== null && template.teras !== teras)) return false;
  const definition = definitionByCode(code);
  if (
    !definition ||
    definition.origin !== 'synthetic' ||
    !code.startsWith('D-') ||
    definition.teras !== teras
  )
    return false;
  return template.id === 'aggregate' ? true : template.code === code;
}

export function validateRows(
  rows: Record<string, unknown>[],
  expected: ExpectedUploadScope,
): { errors: Issue[]; warnings: Issue[]; rows: UploadRow[] } {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const validRows: UploadRow[] = [];
  const sourceKeys = new Set<string>();
  const observations = new Set<string>();

  if (rows.length === 0)
    errors.push(
      issue(1, 'file', 'empty_file', 'Fail mesti mengandungi sekurang-kurangnya satu baris data.'),
    );

  rows.forEach((input, index) => {
    const rowNumber = index + 2;
    const start = errors.length;
    for (const key of Object.keys(input)) {
      if (!columnSet.has(key))
        errors.push(issue(rowNumber, 'header', 'unknown_column', 'Lajur tidak dibenarkan.'));
    }
    for (const [key, raw] of Object.entries(input)) {
      if (
        (typeof raw === 'string' && dangerous.test(raw)) ||
        (typeof raw === 'object' && raw !== null)
      )
        errors.push(
          issue(
            rowNumber,
            columnSet.has(key) ? key : 'header',
            'formula_payload',
            'Formula atau muatan boleh laku tidak dibenarkan.',
          ),
        );
    }

    const schemaVersion = textValue(input.schema_version);
    const classification = textValue(input.classification);
    const sourceKey = textValue(input.source_key);
    const organisation = textValue(input.organisation);
    const geography = textValue(input.geography);
    const period = textValue(input.period);
    const indicatorCode = textValue(input.indicator_code);
    const unit = textValue(input.unit);
    const stateText = textValue(input.state);
    const value = numericValue(input.value);
    const denominator = numericValue(input.denominator);

    if (schemaVersion !== version)
      errors.push(issue(rowNumber, 'schema_version', 'schema_version', 'Versi skema mesti 1.0.'));
    if (classification !== DEMO_LABEL)
      errors.push(
        issue(
          rowNumber,
          'classification',
          'classification',
          'Hanya klasifikasi DEMO / SYNTHETIC diterima.',
        ),
      );
    if (!sourceKey || !safeIdentifier.test(sourceKey))
      errors.push(issue(rowNumber, 'source_key', 'source_key', 'ID sumber tidak sah.'));
    if (organisation !== expected.organisation)
      errors.push(
        issue(
          rowNumber,
          'organisation',
          'organisation_scope',
          'Organisasi di luar skop muat naik.',
        ),
      );
    if (geography !== expected.geography)
      errors.push(
        issue(rowNumber, 'geography', 'geography_scope', 'Geografi di luar skop muat naik.'),
      );
    if (!period || !isCalendarDate(period) || period !== expected.period)
      errors.push(issue(rowNumber, 'period', 'period', 'Tempoh tidak sah atau di luar skop.'));
    if (!indicatorCode || !allowedIndicator(expected.template, expected.teras, indicatorCode))
      errors.push(
        issue(
          rowNumber,
          'indicator_code',
          'indicator_code',
          'Indikator tidak dibenarkan untuk templat dan Teras.',
        ),
      );
    const definition = indicatorCode ? definitionByCode(indicatorCode) : undefined;
    if (!unit || definition?.unit !== unit)
      errors.push(
        issue(rowNumber, 'unit', 'unit', 'Unit tidak sepadan dengan definisi indikator.'),
      );
    if (!stateText || !states.has(stateText as DataState))
      errors.push(issue(rowNumber, 'state', 'state', 'Keadaan data tidak sah.'));
    const state = states.has(stateText as DataState) ? (stateText as DataState) : null;
    if (value === undefined || (value !== null && (value < 0 || (unit === '%' && value > 100))))
      errors.push(
        issue(rowNumber, 'value', 'value_range', 'Nilai mesti nombor dalam julat yang dibenarkan.'),
      );
    if (denominator === undefined || (denominator !== null && denominator <= 0))
      errors.push(
        issue(rowNumber, 'denominator', 'denominator_range', 'Penyebut mesti nombor positif.'),
      );
    if (state === 'value' && value === null)
      errors.push(
        issue(rowNumber, 'value', 'state_value', 'State value memerlukan nilai, termasuk sifar.'),
      );
    if (state && state !== 'value' && value !== null)
      errors.push(
        issue(rowNumber, 'value', 'state_value', 'State tanpa nilai memerlukan value kosong.'),
      );
    if (state && state !== 'value' && denominator !== null)
      errors.push(
        issue(
          rowNumber,
          'denominator',
          'state_denominator',
          'State tanpa nilai memerlukan denominator kosong.',
        ),
      );

    if (sourceKey) {
      if (sourceKeys.has(sourceKey))
        errors.push(issue(rowNumber, 'source_key', 'duplicate_source_key', 'ID sumber berulang.'));
      sourceKeys.add(sourceKey);
    }
    if (indicatorCode && organisation && geography && period) {
      const observation = `${indicatorCode}\u0000${organisation}\u0000${geography}\u0000${period}`;
      if (observations.has(observation))
        errors.push(
          issue(
            rowNumber,
            'indicator_code',
            'duplicate_observation',
            'Pemerhatian berulang dalam fail.',
          ),
        );
      observations.add(observation);
    }

    if (
      errors.length === start &&
      schemaVersion === version &&
      classification === DEMO_LABEL &&
      sourceKey &&
      organisation &&
      geography &&
      period &&
      indicatorCode &&
      unit &&
      state &&
      value !== undefined &&
      denominator !== undefined
    ) {
      validRows.push({
        schemaVersion,
        classification,
        sourceKey,
        organisation,
        geography,
        period,
        indicatorCode,
        unit,
        value,
        state,
        denominator,
      });
    }
  });
  return { errors, warnings, rows: validRows };
}

function assertExampleScope(scope: ExampleScope): void {
  if (
    !Number.isInteger(scope.teras) ||
    !safeIdentifier.test(scope.organisation) ||
    !safeIdentifier.test(scope.geography) ||
    !isCalendarDate(scope.period)
  )
    throw new Error('Example scope is invalid.');
}

export function exampleRows(templateId: TemplateId, scope: ExampleScope): UploadRow[] {
  assertExampleScope(scope);
  const template = templateById.get(templateId);
  if (!template || (template.teras !== null && template.teras !== scope.teras))
    throw new Error('Template does not match the selected Teras.');
  const code =
    template.id === 'aggregate'
      ? metricDefinitions.find(
          (definition) => definition.origin === 'synthetic' && definition.teras === scope.teras,
        )?.code
      : template.code;
  const definition = code ? definitionByCode(code) : undefined;
  if (!definition) throw new Error('No synthetic indicator is available for the example scope.');
  return [
    {
      schemaVersion: version,
      classification: DEMO_LABEL,
      sourceKey: `sample-${templateId}-${scope.period}`,
      organisation: scope.organisation,
      geography: scope.geography,
      period: scope.period,
      indicatorCode: definition.code,
      unit: definition.unit,
      value: 12,
      state: 'value',
      denominator: ['D-BURDEN', 'D-SUPPLY', 'D-HARM', 'D-GAP'].includes(definition.code)
        ? 100_000
        : null,
    },
  ];
}

const camelValue: Record<UploadColumn, keyof UploadRow> = {
  schema_version: 'schemaVersion',
  classification: 'classification',
  source_key: 'sourceKey',
  organisation: 'organisation',
  geography: 'geography',
  period: 'period',
  indicator_code: 'indicatorCode',
  unit: 'unit',
  value: 'value',
  state: 'state',
  denominator: 'denominator',
};

export function templateCSV(templateId: TemplateId, scope: ExampleScope): string {
  const header = uploadColumns.join(',');
  const lines = exampleRows(templateId, scope).map((row) =>
    uploadColumns.map((column) => csvCell(row[camelValue[column]])).join(','),
  );
  return `${header}\r\n${lines.join('\r\n')}\r\n`;
}
