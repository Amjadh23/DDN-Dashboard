import 'server-only';
import supplied from '../../../data/supplied/weekly-2026-08-09.json';
import { allowed, type Session } from '../domain/policy';

export type SourcePurpose = 1 | 2 | 3;
export type SourceSetting = 'RPDI' | 'RPDK' | 'PPP';

export interface SourceSnapshotQuery {
  purpose: SourcePurpose;
  geography?: string;
  setting?: SourceSetting;
}

export interface SourceValueDTO {
  label: string;
  value: number;
  unit: string;
  sourcePage: number;
  semanticNote?: string;
}

export interface SourceDimensionDTO {
  key: string;
  label: string;
  sourcePage: number;
  values: SourceValueDTO[];
}

export interface SourceTableRowDTO {
  label: string;
  values: Record<string, number | null>;
  sourcePage: number;
  status: 'value' | 'unresolved';
  note?: string;
}

export interface SourceTableDTO {
  key: string;
  label: string;
  sourcePage: number;
  columns: { key: string; label: string }[];
  rows: SourceTableRowDTO[];
  caveat?: string;
}

export interface SourceSnapshotDTO {
  purpose: SourcePurpose;
  setting: SourceSetting | null;
  geography: string;
  evidence: 'Available';
  sensitivity: 'public-aggregate';
  publicationState: 'published';
  period: string;
  sourceTitle: string;
  sourcePath: string;
  sourceHash: string;
  sourcePages: number[];
  summary: SourceValueDTO[];
  dimensions: SourceDimensionDTO[];
  tables: SourceTableDTO[];
  caveats: string[];
}

type SourceValue = {
  label: string;
  value: number;
  unit: string;
  sourcePage: number;
  semanticNote?: string;
};

const stateLabels: Record<string, string[]> = {
  'MY-01': ['Johor'],
  'MY-02': ['Kedah'],
  'MY-03': ['Kelantan'],
  'MY-04': ['Melaka'],
  'MY-05': ['N. Sembilan', 'Negeri Sembilan'],
  'MY-06': ['Pahang'],
  'MY-07': ['P. Pinang', 'Pulau Pinang'],
  'MY-08': ['Perak'],
  'MY-09': ['Perlis'],
  'MY-10': ['Selangor'],
  'MY-11': ['Terengganu'],
  'MY-12': ['Sabah'],
  'MY-13': ['Sarawak'],
};

const dimensionLabels: Record<string, string> = {
  sex: 'Jantina direkodkan',
  age: 'Umur',
  sourceStatus: 'Status rekod sumber',
  ethnicity: 'Bangsa',
  education: 'Tahap pendidikan',
  occupationAtRegistration: 'Pekerjaan semasa daftar',
};

const settingKeys: Record<SourceSetting, 'rpdi' | 'rpdk' | 'ppp'> = {
  RPDI: 'rpdi',
  RPDK: 'rpdk',
  PPP: 'ppp',
};

function sourceValue(value: SourceValue): SourceValueDTO {
  return {
    label: value.label,
    value: value.value,
    unit: value.unit,
    sourcePage: value.sourcePage,
    ...(value.semanticNote ? { semanticNote: value.semanticNote } : {}),
  };
}

function profileDimensions(profile: Record<string, unknown>): SourceDimensionDTO[] {
  return Object.entries(dimensionLabels).flatMap(([key, label]) => {
    const values = profile[key];
    if (!Array.isArray(values) || values.length === 0) return [];
    const rows = values as SourceValue[];
    return [
      {
        key,
        label,
        sourcePage: rows[0].sourcePage,
        values: rows.map(sourceValue),
      },
    ];
  });
}

function filterRows<T extends { label: string }>(rows: T[], geography: string): T[] {
  if (geography === 'MY') return rows;
  const labels = stateLabels[geography];
  if (!labels) return [];
  return rows.filter((row) => labels.includes(row.label));
}

function rpdkStateTable(geography: string): SourceTableDTO {
  return {
    key: 'rpdk-state',
    label: supplied.rpdkStateCounts.label,
    sourcePage: supplied.rpdkStateCounts.sourcePage,
    columns: [
      { key: 'mandatory', label: 'Mandatori' },
      { key: 'voluntary', label: 'Sukarela' },
      { key: 'total', label: 'Jumlah' },
    ],
    rows: filterRows(supplied.rpdkStateCounts.rows, geography).map((row) => ({
      label: row.label,
      values: { mandatory: row.mandatory, voluntary: row.voluntary, total: row.total },
      sourcePage: row.sourcePage,
      status: 'value',
    })),
    caveat: supplied.rpdkStateCounts.geographyCaveat,
  };
}

function complaintsTable(geography: string): SourceTableDTO {
  const rows: SourceTableRowDTO[] = filterRows(supplied.complaintsByState.rows, geography).map(
    (row) => ({
      label: row.label,
      values: { cumulative: row.cumulative, weekly: row.weekly },
      sourcePage: row.sourcePage,
      status: 'value',
    }),
  );
  if (geography === 'MY') {
    rows.push({
      label: supplied.complaintsByState.unresolvedPrintedLabel.label,
      values: { cumulative: null, weekly: null },
      sourcePage: supplied.complaintsByState.unresolvedPrintedLabel.sourcePage,
      status: 'unresolved',
      note: supplied.complaintsByState.unresolvedPrintedLabel.note,
    });
  }
  return {
    key: 'complaints-state',
    label: supplied.complaintsByState.label,
    sourcePage: supplied.complaintsByState.sourcePage,
    columns: [
      { key: 'cumulative', label: 'Terkumpul' },
      { key: 'weekly', label: 'Mingguan' },
    ],
    rows,
    caveat: 'Aduan ialah isyarat dan bukan kesalahan yang disahkan.',
  };
}

function arrestsTable(geography: string): SourceTableDTO {
  return {
    key: 'arrests-state',
    label: supplied.suspectedPersonArrestsByState.label,
    sourcePage: supplied.suspectedPersonArrestsByState.sourcePage,
    columns: [{ key: 'value', label: 'Tangkapan OYDS' }],
    rows: filterRows(supplied.suspectedPersonArrestsByState.rows, geography).map((row) => ({
      label: row.label,
      values: { value: row.value },
      sourcePage: row.sourcePage,
      status: 'value',
    })),
    caveat:
      'Tangkapan orang yang disyaki bukan bukti bersalah, sabitan atau anggaran prevalens komuniti.',
  };
}

function legalBasisTable(): SourceTableDTO {
  return {
    key: 'rpdk-legal-basis',
    label: supplied.rpdkLegalBasisCounts.label,
    sourcePage: supplied.rpdkLegalBasisCounts.sourcePage,
    columns: [
      { key: 'mandatory', label: 'Mandatori' },
      { key: 'voluntary', label: 'Sukarela' },
    ],
    rows: [
      ...supplied.rpdkLegalBasisCounts.mandatory.map((row) => ({
        label: row.label,
        values: { mandatory: row.value, voluntary: null },
        sourcePage: row.sourcePage,
        status: 'value' as const,
      })),
      ...supplied.rpdkLegalBasisCounts.voluntary.map((row) => ({
        label: row.label,
        values: { mandatory: null, voluntary: row.value },
        sourcePage: row.sourcePage,
        status: 'value' as const,
      })),
    ],
  };
}

function settingSummary(setting: SourceSetting): SourceValueDTO[] {
  const source = supplied.treatmentSettings.find((item) => item.code === setting.toLowerCase());
  if (!source) return [];
  const pathwayCounts =
    'pathwayCounts' in source && Array.isArray(source.pathwayCounts)
      ? source.pathwayCounts.map(sourceValue)
      : [];
  return [sourceValue(source.clientCount), sourceValue(source.facilityCount), ...pathwayCounts];
}

function headlineValue(code: string): SourceValueDTO {
  const value = supplied.headline.find((item) => item.code === code);
  if (!value) throw new Error(`Nilai sumber tidak ditemui: ${code}`);
  return sourceValue(value);
}

function federalTerritoryCaveat(geography: string): string[] {
  if (!['MY-14', 'MY-15', 'MY-16'].includes(geography)) return [];
  return [
    'Sumber menggabungkan Wilayah Persekutuan. Nilai gabungan tidak diperuntukkan kepada Kuala Lumpur, Labuan atau Putrajaya.',
  ];
}

function collectPages(
  summary: SourceValueDTO[],
  dimensions: SourceDimensionDTO[],
  tables: SourceTableDTO[],
) {
  return [
    ...new Set([
      ...summary.map((item) => item.sourcePage),
      ...dimensions.map((item) => item.sourcePage),
      ...tables.map((item) => item.sourcePage),
    ]),
  ].sort((a, b) => a - b);
}

export function getSourceSnapshot(
  session: Session,
  { purpose, geography = 'MY', setting }: SourceSnapshotQuery,
): SourceSnapshotDTO {
  if (!/^(MY|MY-(0[1-9]|1[0-6]))$/.test(geography)) throw new Error('Geografi sumber tidak sah.');
  if (
    !allowed(session, 'view', {
      organisation: 'shared',
      geography: 'MY',
      teras: purpose,
      sensitivity: 'public-aggregate',
      state: 'published',
    })
  )
    throw new Error('Akses ditolak untuk petikan sumber diterbitkan.');

  const isNational = geography === 'MY';
  const selectedSetting = setting ?? (purpose === 2 ? 'RPDK' : null);
  let summary: SourceValueDTO[] = [];
  let dimensions: SourceDimensionDTO[] = [];
  let tables: SourceTableDTO[] = [];
  const caveats = [
    'Nilai ini ialah kiraan agregat petikan 9 Ogos 2026; tiada kadar atau formula baharu dikira.',
    ...federalTerritoryCaveat(geography),
  ];

  if (purpose === 1) {
    if (isNational) {
      summary = selectedSetting
        ? settingSummary(selectedSetting)
        : [headlineValue('aadk_clients_total')];
      const profile = selectedSetting
        ? supplied.demographics[settingKeys[selectedSetting]]
        : supplied.demographics.aadkOverall;
      dimensions = profileDimensions(profile as unknown as Record<string, unknown>).filter(
        (dimension) => dimension.key !== 'sourceStatus',
      );
    }
    if (!selectedSetting || selectedSetting === 'RPDK') tables = [rpdkStateTable(geography)];
    caveats.push(
      'Profil klien memberi konteks beban sahaja dan tidak mengukur capaian atau keberkesanan pencegahan.',
    );
  }

  if (purpose === 2) {
    if (isNational) {
      summary = settingSummary(selectedSetting as SourceSetting);
      dimensions = profileDimensions(
        supplied.demographics[settingKeys[selectedSetting as SourceSetting]] as unknown as Record<
          string,
          unknown
        >,
      );
    }
    if (selectedSetting === 'RPDK') {
      tables = [rpdkStateTable(geography), ...(isNational ? [legalBasisTable()] : [])];
    } else if (!isNational) {
      caveats.push(`Pecahan negeri untuk ${selectedSetting} tidak dibekalkan dalam petikan ini.`);
    }
    if (selectedSetting === 'PPP') {
      caveats.push(
        'PPP ialah petikan berasingan dan tidak ditambah kepada jumlah AADK tanpa pengesahan skop dan pertindihan.',
      );
    }
    caveats.push('Status Berulang ialah status rekod sumber dan bukan relaps.');
  }

  if (purpose === 3) {
    if (isNational) {
      summary = [
        headlineValue('complaints_cumulative'),
        headlineValue('complaints_weekly'),
        headlineValue('suspected_person_arrests'),
      ];
    }
    tables = [complaintsTable(geography), arrestsTable(geography)];
    caveats.push(
      'Aduan ialah isyarat, bukan kesalahan disahkan; tangkapan OYDS bukan bukti bersalah, sabitan atau prevalens.',
    );
  }

  return {
    purpose,
    setting: selectedSetting,
    geography,
    evidence: 'Available',
    sensitivity: 'public-aggregate',
    publicationState: 'published',
    period: supplied.asOfDate,
    sourceTitle: supplied.title,
    sourcePath: supplied.source.path,
    sourceHash: supplied.source.sha256,
    sourcePages: collectPages(summary, dimensions, tables),
    summary,
    dimensions,
    tables,
    caveats,
  };
}
