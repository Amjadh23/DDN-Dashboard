import 'server-only';
import { getAnnual } from './annual';
import { annualDefinitions, annualCode, annualCatalog, type AnnualView } from '../domain/annual';
import { isAnnualPeriod, type Filters } from '../domain/filters';
import type { Session } from '../domain/policy';
import type { MetricDTO } from '../domain/types';
import type { SourceSnapshotDTO, SourceSetting, SourcePurpose } from './source-snapshot';
import { preventionTotals } from '../domain/dashboard-bindings';

export async function getDashboardSource(session: Session, filters: Filters, teras: number) {
  if (!isAnnualPeriod(filters.period)) return [];
  const ids = annualCatalog.tables
    .filter((t) => t.teras === teras && t.id !== 'population')
    .map((t) => t.id);
  const views = await Promise.all(ids.map((id) => getAnnual(session, filters, id)));
  return views.filter((v): v is AnnualView => v !== null);
}
export async function getPreventionTrend(session: Session, filters: Filters) {
  if (!isAnnualPeriod(filters.period)) return [];
  const years = ['2021', '2022', '2023', '2024', '2025'].filter((year) => year <= filters.period);
  const points = await Promise.all(
    years.map(async (period) => {
      const views = await Promise.all(
        ['4.1-family', '4.1-education', '4.1-workplace'].map((id) =>
          getAnnual(session, { ...filters, period, compare: 'none' }, id),
        ),
      );
      const value = preventionTotals(
        views.filter((v): v is AnnualView => v !== null),
        filters.geography,
      ).participants;
      return value === null ? null : { label: period, value };
    }),
  );
  return points.filter((point): point is { label: string; value: number } => point !== null);
}

export async function getAnnualMetrics(session: Session, filters: Filters): Promise<MetricDTO[]> {
  const views = await Promise.all(
    ['2.1', '3.1', '6.2'].map((id) => getAnnual(session, filters, id)),
  );
  return views.flatMap((view) => {
    if (!view) return [];
    const row = view.rows.find(
      (r) => r.geography === filters.geography && (view.id !== '3.1' || r.label === 'Jumlah'),
    );
    if (!row) return [];
    return view.columns.flatMap((column) => {
      const cell = row.cells[column.key];
      if (!cell) return [];
      const definition = annualDefinitions.find((d) => d.code === annualCode(view.id, column.key))!;
      const names: Record<string, string> = {
        'A-2-1-TOTAL': 'Jumlah klien AADK',
        'A-2-1-COMMUNITY': 'Klien rawatan komuniti',
        'A-2-1-INSTITUTION': 'Klien rawatan institusi',
        'A-3-1-COUNT': 'Tangkapan PDRM mengikut seksyen sumber',
        'A-6-2-OPERATIONS': 'Operasi AADK',
        'A-6-2-SCREENED': 'Saringan awal AADK',
      };
      return [
        {
          definition: {
            ...definition,
            name: names[definition.code] ?? definition.name,
            unit: cell.unit,
            sourcePage: cell.page,
          },
          value: cell.value,
          state: cell.state,
          period: filters.period,
          geography: row.geography,
          refreshed: '2026-10-07',
          previous: null,
          confidence: 'Petikan disemak; takrif operasi dan pemilik memerlukan pengesahan.',
          publication: view.publications[0],
        },
      ];
    });
  });
}

export async function getAnnualSnapshot(
  session: Session,
  filters: Filters,
  purpose: SourcePurpose,
  setting?: SourceSetting,
): Promise<SourceSnapshotDTO> {
  const views = await getDashboardSource(session, filters, purpose);
  const selected = views
    .filter(() => purpose !== 2 || setting !== 'PPP')
    .filter((v) => v.id !== '2.11' || setting === 'RPDI');
  return {
    purpose,
    setting: purpose === 2 ? (setting ?? null) : null,
    geography: filters.geography,
    evidence: 'Available',
    sensitivity: 'public-aggregate',
    publicationState: 'published',
    period: filters.period,
    sourceTitle: 'Buku Maklumat Dadah 2025 · petikan tahunan',
    sourcePath: 'data/Laporan-Buku-Dadah-2025.pdf',
    sourceHash: annualCatalog.sourceHash,
    sourcePages: [...new Set(selected.flatMap((v) => v.pages))].sort((a, b) => a - b),
    summary: [],
    dimensions: [],
    tables: selected.map((view) => {
      const profiles = ['2.3', '2.4', '2.5', '2.7', '2.8', '2.9'].includes(view.id);
      const settingColumn = setting === 'RPDI' ? 'institution' : 'community';
      const columns = view.columns.filter(
        (c) => !setting || !['2.1', '2.6'].includes(view.id) || c.key === settingColumn,
      );
      return {
        key: view.id,
        label: view.title,
        sourcePage: view.pages[0],
        columns: columns.map((c) => ({ key: c.key, label: `${c.label} (${c.unit})` })),
        rows: view.rows
          .filter((r) => !profiles || !setting || r.label === setting)
          .map((row) => ({
            label:
              row.label +
              (row.cells[columns[0]?.key]?.unit && columns[0]?.unit === 'unit sumber'
                ? ` (${row.cells[columns[0].key].unit})`
                : ''),
            values: Object.fromEntries(
              columns.map((c) => [c.key, row.cells[c.key]?.value ?? null]),
            ),
            sourcePage: row.page,
            status: 'unresolved' as const,
          })),
        caveat: view.notes.join(' '),
      };
    }),
    caveats: [
      'Tempoh tahunan; bukan stok mingguan atau suapan langsung. Jadual kebangsaan tidak dianggarkan untuk negeri.',
      ...(purpose === 1
        ? [
            'Kiraan peserta bukan orang unik. Kluster komuniti ditahan kerana jumlah tidak konsisten. Profil pentadbiran tidak mengukur keberkesanan pencegahan.',
          ]
        : []),
      ...(purpose === 2
        ? [
            'Kaedah kiraan rawatan berubah pada 2025; perbandingan merentas perubahan ini tidak dikira. Status berulang bukan relaps.',
            ...(setting === 'PPP'
              ? ['Tiada pecahan PPP yang sepadan dalam jadual rawatan ini.']
              : []),
          ]
        : []),
      ...(purpose === 3
        ? [
            'Aduan ditahan: jumlah 7,394 dan 7,395 bercanggah. Tangkapan PDRM tidak sama dengan tangkapan OYDS AADK, sabitan atau prevalens.',
          ]
        : []),
    ],
  };
}
