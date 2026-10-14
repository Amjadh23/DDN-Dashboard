import 'server-only';
import { withScope, audit } from './db';
import { allowed, type Session } from '../domain/policy';
import {
  annualCatalog,
  annualChange,
  annualCSV,
  type AnnualTable,
  type AnnualView,
  type AnnualViewRow,
} from '../domain/annual';
import { databasePeriod, isAnnualPeriod, type Filters } from '../domain/filters';
import { rate } from '../domain/semantics';

export async function getAnnual(
  session: Session,
  filters: Filters,
  id: string,
  permission: 'view' | 'export' = 'view',
): Promise<AnnualView | null> {
  const table: AnnualTable | undefined = annualCatalog.tables.find((t) => t.id === id);
  if (
    !table ||
    !isAnnualPeriod(filters.period) ||
    filters.source === 'synthetic' ||
    filters.organisation !== 'all' ||
    filters.confidence !== 'all'
  )
    return null;
  return withScope(session, async (c) => {
    const result = await c.query(
      "SELECT geography,teras,value,state,unit,period::text,publication_id,metadata FROM supplied.observation WHERE definition_version='bmd-v1' AND metadata->>'table'=ANY($1::text[]) AND period=ANY($2::date[]) AND ($3='MY' OR geography=$3) ORDER BY id",
      [
        id === '1.1' ? ['1.1', 'population'] : [id],
        [
          databasePeriod(filters.period),
          databasePeriod(filters.compare === 'none' ? filters.period : filters.compare),
        ],
        filters.geography,
      ],
    );
    const visible = result.rows.filter((row) =>
      allowed(session, permission, {
        organisation: 'shared',
        geography: row.geography,
        teras: row.teras,
        sensitivity: 'public-aggregate',
        state: 'published',
      }),
    );
    const current = visible.filter(
      (r) => r.period === databasePeriod(filters.period) && r.metadata.table === id,
    );
    if (!current.length) return null;
    const rows = new Map<string, AnnualViewRow>();
    for (const r of current) {
      const key = `${r.geography}:${r.metadata.label}`;
      let row = rows.get(key);
      if (!row) {
        row = {
          label: r.metadata.label,
          geography: r.geography,
          page: r.metadata.sourcePage,
          cells: {},
        };
        rows.set(key, row);
      }
      const previous = visible.find(
        (p) =>
          p.period === databasePeriod(filters.compare) &&
          p.metadata.table === id &&
          p.geography === r.geography &&
          p.metadata.label === r.metadata.label &&
          p.metadata.column === r.metadata.column,
      );
      const value = r.value === null ? null : Number(r.value),
        prior = previous?.value == null ? null : Number(previous.value);
      row.cells[r.metadata.column] = {
        page: r.metadata.sourcePage,
        value,
        state: r.state,
        unit: r.unit,
        previous: prior,
        change: annualChange(
          value,
          prior,
          Number(filters.period),
          Number(filters.compare),
          table.comparisonBreak,
        ),
      };
      if (id === '1.1') {
        const population = visible.find(
          (p) =>
            p.metadata.table === 'population' &&
            p.geography === r.geography &&
            p.period === r.period,
        );
        row.denominator = population?.value == null ? null : Number(population.value);
        row.rate = rate(value, row.denominator);
      }
    }
    return {
      id,
      title: table.title,
      teras: table.teras,
      year: filters.period,
      compare: filters.compare,
      columns: table.columns,
      rows: [...rows.values()].sort(
        (a, b) => a.geography.localeCompare(b.geography) || a.label.localeCompare(b.label),
      ),
      notes: [
        ...table.notes,
        ...annualCatalog.quarantine
          .filter((q) => q.id === id || q.id.startsWith(`${id}/${filters.period}`))
          .map((q) => `Ditahan: ${q.id} — ${q.reason}`),
        ...(id === '1.1'
          ? [
              'Derived: kadar = kiraan ÷ penduduk DOSM dalam BMD p.170 × 100,000 (p.171); tersedia 2024–2025 sahaja. Sempadan negeri belum diluluskan; tiada kategori ancaman rasmi.',
            ]
          : []),
      ],
      pages: table.pages,
      sourceHash: annualCatalog.sourceHash,
      publications: [...new Set(current.map((r) => String(r.publication_id)))],
    };
  });
}
export async function exportAnnual(session: Session, filters: Filters, id: string) {
  const view = await getAnnual(session, filters, id, 'export');
  if (!view) throw new Error('Export not permitted or unavailable.');
  await withScope(session, (c) =>
    audit(
      c,
      session,
      'export-annual',
      id,
      `${filters.period} · scoped aggregate CSV · ${view.sourceHash}`,
    ),
  );
  return annualCSV(view);
}
