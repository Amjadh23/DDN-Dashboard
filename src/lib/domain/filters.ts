import type { Layer } from './types';
export interface Filters {
  period: string;
  compare: string;
  geography: string;
  layer: Layer;
  mode: 'rate' | 'count';
  source: 'all' | 'supplied' | 'synthetic';
  confidence: 'all' | 'complete';
  organisation: string;
}
export const defaultFilters: Filters = {
  period: '2026-08-09',
  compare: 'none',
  geography: 'MY',
  layer: 'burden',
  mode: 'rate',
  source: 'all',
  confidence: 'all',
  organisation: 'all',
};
export const annualPeriods = ['2025', '2024', '2023', '2022', '2021'] as const;
export const isAnnualPeriod = (period: string) =>
  annualPeriods.includes(period as (typeof annualPeriods)[number]);
export const databasePeriod = (period: string) =>
  isAnnualPeriod(period) ? `${period}-12-31` : period;
export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const pick = <T extends string>(key: string, choices: readonly T[], fallback: T): T =>
    choices.includes(params[key] as T) ? (params[key] as T) : fallback;
  const geography =
    typeof params.geography === 'string' && /^(MY|MY-(0[1-9]|1[0-6]))$/.test(params.geography)
      ? params.geography
      : 'MY';
  const period = pick('period', ['2026-08-09', '2026-08-02', ...annualPeriods], '2026-08-09');
  return {
    period,
    compare: isAnnualPeriod(period) ? 'none' : pick('compare', ['none', '2026-08-02'], 'none'),
    geography,
    layer: pick('layer', ['burden', 'supply', 'harm', 'gap', 'confidence'], 'burden'),
    mode: pick('mode', ['rate', 'count'], 'rate'),
    source: pick('source', ['all', 'supplied', 'synthetic'], 'all'),
    confidence: pick('confidence', ['all', 'complete'], 'all'),
    organisation: pick('organisation', ['all', 'demo-a', 'demo-b'], 'all'),
  };
}
export function filterQuery(filters: Partial<Filters>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v !== undefined) p.set(k, v);
  return p.toString();
}

/** Carry only recognised analytical filters between pages, never workflow/private query data. */
export function navigationHref(
  path: string,
  filters: Filters,
  selectedState?: string | null,
): string {
  const current = /^\/ddn-2\/teras\/([1-4])$/.exec(path)?.[1];
  const destination = current === '4' ? '5' : (current ?? /^\/teras\/([1-5])$/.exec(path)?.[1]);
  const geography =
    filters.geography === 'MY' && selectedState && /^MY-(0[1-9]|1[0-6])$/.test(selectedState)
      ? selectedState
      : filters.geography;
  const next = { ...filters, geography };
  if (destination) {
    next.layer = destination === '3' ? 'supply' : destination === '4' ? 'harm' : 'burden';
    if (destination === '5') next.geography = 'MY';
  }
  const query = new URLSearchParams(filterQuery(next));
  // The merged page chooses treatment or harm from the viewer's existing grants.
  // Injecting burden here overrides the harm-only viewer's correct default.
  if (current === '2') query.delete('layer');
  return `${path}?${query}`;
}
