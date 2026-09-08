export type Evidence = 'Policy' | 'Available' | 'Derived' | 'Proposed' | 'Validation required';
export type DataState = 'value' | 'unknown' | 'not-collected' | 'not-applicable' | 'suppressed';
export type Origin = 'supplied' | 'synthetic';
export type Layer = 'burden' | 'supply' | 'harm' | 'gap' | 'confidence';
export interface MetricDefinition {
  code: string;
  name: string;
  nameEn: string;
  purpose: string;
  evidence: Evidence;
  teras: number;
  numerator: string;
  denominator: string;
  formula: string;
  unit: string;
  direction: string;
  dimensions: string[];
  cadence: string;
  freshness: string;
  source: string;
  sourcePage: number | null;
  owner: string;
  ownerStatus: string;
  qualityRules: string;
  target: string;
  suppression: string;
  interpretation: string;
  version: string;
  effectiveFrom: string;
  origin: Origin;
}
export interface MetricDTO {
  definition: MetricDefinition;
  value: number | null;
  state: DataState;
  period: string;
  refreshed: string;
  previous: number | null;
  confidence: string;
  publication: string;
}
export interface MapZoneDTO {
  id: string;
  name: string;
  layer: Layer;
  count: number | null;
  denominator: number | null;
  rate: number | null;
  previous: number | null;
  change: number | null;
  state: DataState;
  confidence: number | null;
  coverage: number | null;
  period: string;
  source: string;
  denominatorSource: string;
  boundary: string;
  definition: string;
  publication: string;
  synthetic: true;
  drivers: { label: string; value: number | null; unit: string }[];
}
export const DEMO_LABEL = 'DEMO / SYNTHETIC';
export const PERIOD = '2026-08-09';
export const REFRESHED = '2026-09-07T00:00:00.000Z';
export const BOUNDARY = 'gb-MYS-ADM1-2017-9469f09';
export const formatNumber = (n: number | null, digits = 0) =>
  n === null ? '—' : new Intl.NumberFormat('ms-MY', { maximumFractionDigits: digits }).format(n);
export const dateBM = (s: string) =>
  new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(new Date(s));
