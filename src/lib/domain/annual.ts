import { z } from 'zod';
import catalog from '../../../data/supplied/annual-catalog.json';
import { periodChange, rate, csvCell } from './semantics';
import type { MetricDefinition } from './types';

export const annualRowSchema = z.object({
  label: z.string().min(1).max(300),
  geography: z.string().regex(/^(MY|MY-WP|MY-(0[1-9]|1[0-6]))$/),
  year: z.number().int().min(2021).max(2025),
  page: z.number().int().min(1).max(188),
  values: z.record(z.string(), z.number().finite().nonnegative().nullable()),
  unit: z.string().optional(),
  columnPages: z.record(z.string(), z.number().int().min(1).max(188)).optional(),
});
export type AnnualRow = z.infer<typeof annualRowSchema>;
export type AnnualTable = (typeof catalog.tables)[number] & { comparisonBreak?: number };
export const annualCatalog = catalog;
export const annualCode = (table: string, column: string) =>
  `A-${table.replaceAll('.', '-').toUpperCase()}-${column.toUpperCase()}`;
export function annualChange(
  current: number | null,
  prior: number | null,
  year: number,
  compare: number,
  breakYear?: number,
) {
  return breakYear && Math.min(year, compare) < breakYear && Math.max(year, compare) >= breakYear
    ? null
    : periodChange(current, prior);
}
export function validateAnnual(input: unknown): {
  tables: (AnnualTable & { rows: AnnualRow[] })[];
  sourceHash: string;
} {
  const manifest = z
    .object({
      schemaVersion: z.literal('bmd-annual-v1'),
      sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
      official: z.literal(false),
      tables: z.array(
        z
          .object({
            id: z.string(),
            rows: z.array(annualRowSchema),
            reconciliation: z.array(
              z.object({
                year: z.number(),
                column: z.string(),
                total: z.number().nullable(),
                knownSum: z.number(),
              }),
            ),
          })
          .passthrough(),
      ),
    })
    .parse(input);
  if (manifest.sourceHash !== catalog.sourceHash) throw new Error('Annual source hash mismatch.');
  const ids = new Set<string>();
  const tables = manifest.tables.map((t) => {
    const definition = catalog.tables.find((d) => d.id === t.id);
    if (!definition || ids.has(t.id)) throw new Error('Unregistered or duplicate annual table.');
    if (t.rows.length !== definition.rowCount) throw new Error('Annual row coverage mismatch.');
    ids.add(t.id);
    const keys = new Set<string>();
    for (const row of t.rows) {
      const key = `${row.year}:${row.label}`;
      if (keys.has(key) || !Object.keys(row.values).length)
        throw new Error('Duplicate or empty annual row.');
      keys.add(key);
      for (const [column, value] of Object.entries(row.values)) {
        if (!definition.columns.some((c) => c.key === column))
          throw new Error('Unknown annual measure.');
        if (
          catalog.quarantine.some(
            (q) => q.id === `${t.id}/${row.year}/${column}` || q.id === `${t.id}/${row.year}`,
          )
        )
          throw new Error('Quarantined annual partition.');
        const unit = row.unit ?? definition.columns.find((c) => c.key === column)!.unit;
        if (
          [
            'orang',
            'klien',
            'klien dilaporkan',
            'peserta',
            'saringan dilaporkan',
            'saringan positif',
            'tangkapan',
            'kemasukan',
          ].includes(unit) &&
          value !== null &&
          value > 0 &&
          value < 5
        )
          throw new Error('Unapproved small-person cell.');
      }
    }
    return { ...definition, rows: t.rows, reconciliation: t.reconciliation };
  });
  if (tables.length !== catalog.tables.length) throw new Error('Annual table coverage mismatch.');
  for (const table of tables) {
    for (const check of table.reconciliation) {
      const rows = table.rows.filter((r) => r.year === check.year);
      const total = rows.find((r) => ['Jumlah', 'Malaysia'].includes(r.label));
      if (!total || !(check.column in total.values))
        throw new Error('Annual reconciliation total missing.');
      const sum = rows
        .filter((r) => r !== total)
        .reduce((s, r) => s + (r.values[check.column] ?? 0), 0);
      if (
        Math.abs(sum - (total.values[check.column] ?? 0)) > 0.011 ||
        total.values[check.column] !== check.total
      )
        throw new Error('Annual reconciliation failed.');
    }
  }
  return { tables, sourceHash: manifest.sourceHash };
}

export const annualDefinitions: MetricDefinition[] = catalog.tables.flatMap((table) =>
  table.columns.map((column) => ({
    code: annualCode(table.id, column.key),
    name: `${table.title} — ${column.label}`,
    nameEn: `${table.id}: ${column.key}`,
    teras: table.teras,
    origin: 'supplied' as const,
    purpose: 'Memahami beban dan aktiviti tahunan yang dilaporkan dalam BMD 2025.',
    evidence: table.id === '5.4' ? ('Validation required' as const) : ('Available' as const),
    numerator: column.label,
    denominator:
      table.id === '1.1'
        ? 'Anggaran penduduk DOSM dalam BMD p.170, 2024 atau 2025; versi sempadan memerlukan pengesahan.'
        : 'Tidak berkenaan untuk kiraan; unit mengikut baris sumber.',
    formula:
      table.id === '1.1'
        ? 'Kiraan sumber; kadar petikan = kiraan / penduduk tahun yang sama × 100,000 (p.171). Tiada ambang ancaman.'
        : 'Nilai agregat sumber; jangan tambah baris, unit atau kumpulan yang bertindih.',
    unit: column.unit,
    direction: 'Konteks diperlukan; aktiviti bukan impak.',
    dimensions:
      table.scope === 'state'
        ? ['tahun', 'negeri mengikut sumber']
        : ['tahun', 'kategori sumber kebangsaan'],
    cadence: 'Tahunan',
    freshness:
      'BMD 2025, tempoh 2021–2025 mengikut jadual; diekstrak 6 Oktober 2026. Bukan suapan langsung.',
    source: `Buku Maklumat Dadah 2025 · Jadual ${table.id} · Penerbit: Agensi Antidadah Kebangsaan`,
    sourcePage: table.pages[0],
    owner:
      'AADK (penerbit); pembekal jadual mengikut sumber PDF. Pemilik indikator semasa belum disahkan.',
    ownerStatus: 'requires stakeholder validation',
    qualityRules:
      'Checksum sumber, lebar baris, unit, jumlah, geografi dan partition dikuarantin disahkan sebelum transaksi.',
    target: 'Validation required — tiada sasaran atau kategori ancaman diluluskan.',
    suppression:
      'Sel orang kecil dan partition yang membolehkan pembinaan semula ditahan sepenuhnya; dasar pendedahan rasmi belum diluluskan.',
    interpretation: table.notes.join(' '),
    version: 'bmd-v1',
    effectiveFrom: '2021-01-01',
  })),
);

export interface AnnualCell {
  page: number;
  value: number | null;
  state: 'value' | 'unknown';
  unit: string;
  previous: number | null;
  change: number | null;
}
export interface AnnualViewRow {
  label: string;
  geography: string;
  page: number;
  cells: Record<string, AnnualCell>;
  denominator?: number | null;
  rate?: number | null;
}
export interface AnnualView {
  id: string;
  title: string;
  teras: number;
  year: string;
  compare: string;
  columns: AnnualTable['columns'];
  rows: AnnualViewRow[];
  notes: string[];
  pages: number[];
  sourceHash: string;
  publications: string[];
}
export function annualCSV(view: AnnualView): string {
  const lines: unknown[][] = [
    ['Sumber', 'Agensi Antidadah Kebangsaan — Buku Maklumat Dadah 2025'],
    ['Jadual', view.id],
    ['Tempoh', view.year],
    ['Status', 'Petikan sumber; bukan penerbitan rasmi platform'],
    ['SHA-256', view.sourceHash],
    ['Penerbitan', view.publications.join(' | ')],
    ['Definisi', 'bmd-v1'],
    ['Caveat', view.notes.join(' | ')],
    ['Tempoh perbandingan', view.compare],
    [
      'Kategori',
      'Geografi',
      'Halaman',
      'Ukuran',
      'Nilai',
      'Status',
      'Unit',
      'Perbandingan',
      'Perubahan %',
      'Penduduk',
      'Kadar / 100,000',
    ],
  ];
  for (const row of view.rows)
    for (const col of view.columns) {
      const cell = row.cells[col.key];
      if (cell)
        lines.push([
          row.label,
          row.geography,
          cell.page,
          col.label,
          cell.value,
          cell.state,
          cell.unit,
          cell.previous,
          cell.change,
          row.denominator,
          row.rate,
        ]);
    }
  return '\ufeff' + lines.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export { rate };
