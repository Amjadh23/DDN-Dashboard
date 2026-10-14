import type { MapZoneDTO } from './types';

// User-supplied design methodology, observed in the Vercel legend on 7 October 2026.
// This metadata applies only to synthetic demonstrations, never official zoning.
export const demoPalette = {
  version: 'demo-relative-range-v1',
  method: 'Positive visible rate range divided into three equal intervals',
  low: { colour: '#268963', label: '● Rendah · relatif demo' },
  medium: { colour: '#e4bd43', label: '◆ Sederhana · relatif demo' },
  high: { colour: '#d24b5c', label: '▲ Tinggi · relatif demo' },
} as const;

export function relativeDemoRange(zones: MapZoneDTO[], suppliedRates = false) {
  const values = zones
    .filter(
      (zone) =>
        (suppliedRates
          ? !zone.synthetic && ['2024', '2025'].includes(zone.period) && zone.layer === 'burden'
          : zone.synthetic) &&
        zone.state === 'value' &&
        zone.rate !== null &&
        Number.isFinite(zone.rate) &&
        zone.rate > 0,
    )
    .map((zone) => zone.rate!);
  if (!values.length) return null;
  const min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) return null;
  return { min, max, low: min + (max - min) / 3, medium: min + (2 * (max - min)) / 3 };
}

export function relativeDemoBand(
  zone: MapZoneDTO | undefined,
  range: ReturnType<typeof relativeDemoRange>,
  suppliedRates = false,
) {
  if (
    !range ||
    !zone ||
    (suppliedRates
      ? zone.synthetic || !['2024', '2025'].includes(zone.period) || zone.layer !== 'burden'
      : !zone.synthetic) ||
    zone.state !== 'value' ||
    zone.rate === null ||
    !Number.isFinite(zone.rate) ||
    zone.rate <= 0
  )
    return null;
  return zone.rate <= range.low ? 'low' : zone.rate <= range.medium ? 'medium' : 'high';
}
