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
export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const pick = <T extends string>(key: string, choices: readonly T[], fallback: T): T =>
    choices.includes(params[key] as T) ? (params[key] as T) : fallback;
  const geography =
    typeof params.geography === 'string' && /^(MY|MY-(0[1-9]|1[0-6]))$/.test(params.geography)
      ? params.geography
      : 'MY';
  return {
    period: pick('period', ['2026-08-09', '2026-08-02'], '2026-08-09'),
    compare: pick('compare', ['none', '2026-08-02'], 'none'),
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
