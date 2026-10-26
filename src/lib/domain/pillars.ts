import { filterQuery, parseFilters } from './filters';

/** Policy presentation IDs must never be used as persisted access-domain IDs. */
export type PolicyPillarId = 1 | 2 | 3 | 4;
export type LegacyDomainId = 1 | 2 | 3 | 4 | 5;
export const POLICY_MAPPING_VERSION = 'ddn2-client-2026-10-26' as const;
export const pillars = {
  1: { title: 'Pencegahan Pintar & Generasi Celik', domains: [1], accent: 'teal' },
  2: { title: 'Pemulihan Tingkah Laku & Kesihatan Awam', domains: [2, 4], accent: 'blue' },
  3: { title: 'Penguatkuasaan Proaktif dan Ramalan Risiko', domains: [3], accent: 'amber' },
  4: { title: 'Kerjasama Antarabangsa & Tadbir Urus Inklusif', domains: [5], accent: 'violet' },
} as const;
export const pillarIds: PolicyPillarId[] = [1, 2, 3, 4];
export const domainNames: Record<LegacyDomainId, string> = {
  1: 'Pendidikan pencegahan',
  2: 'Rawatan dan pemulihan',
  3: 'Penguatkuasaan',
  4: 'Pengurangan kemudaratan',
  5: 'Kerjasama antarabangsa',
};
export function isDomain(id: number): id is LegacyDomainId {
  return Number.isInteger(id) && id >= 1 && id <= 5;
}
export function isPillar(id: number): id is PolicyPillarId {
  return Number.isInteger(id) && id >= 1 && id <= 4;
}
export function pillarForDomain(domain: number): PolicyPillarId | null {
  return isDomain(domain) ? ({ 1: 1, 2: 2, 3: 3, 4: 2, 5: 4 } as const)[domain] : null;
}
export function domainLabel(domain: number): string {
  return isDomain(domain)
    ? `Teras ${pillarForDomain(domain)} · ${domainNames[domain]}`
    : 'Domain tidak diketahui';
}
export function domainHref(domain: number): string {
  if (!isDomain(domain)) throw new Error('Unknown data domain');
  return `/ddn-2/teras/${pillarForDomain(domain)}${domain === 4 ? '?domain=harm' : ''}`;
}
export function resolveDomain(
  pillar: PolicyPillarId,
  requested: unknown,
  grants: readonly number[],
): LegacyDomainId | null {
  const domains: readonly LegacyDomainId[] = pillars[pillar].domains;
  if (requested !== undefined) {
    const explicit = requested === 'harm' ? 4 : requested === 'treatment' ? 2 : null;
    return explicit && domains.includes(explicit) && grants.includes(explicit) ? explicit : null;
  }
  return domains.find((id) => grants.includes(id)) ?? null;
}
export function legacyTerasHref(
  domain: number,
  params: Record<string, string | string[] | undefined>,
): string {
  if (!isDomain(domain)) throw new Error('Unknown data domain');
  const filters = parseFilters({
    ...params,
    geography: domain === 5 ? 'MY' : params.geography,
    layer: params.layer ?? (domain === 4 ? 'harm' : domain === 3 ? 'supply' : 'burden'),
  });
  const query = new URLSearchParams(filterQuery(filters));
  if (domain === 4) query.set('domain', 'harm');
  if (domain === 2) query.set('domain', 'treatment');
  for (const [key, choices] of Object.entries({
    perspective: ['needs', 'process', 'outcomes', 'cost', 'satisfaction'],
    cohort: ['2025-q4', '2026-q1'],
    setting: ['RPDI', 'RPDK', 'PPP'],
  })) {
    const value = params[key];
    if (typeof value === 'string' && choices.includes(value)) query.set(key, value);
  }
  return `/ddn-2/teras/${pillarForDomain(domain)}?${query}`;
}
