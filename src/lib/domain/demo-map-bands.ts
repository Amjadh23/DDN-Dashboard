// Presentation rule only. Not approved official threat or clinical thresholds.
export const demoBandVersion = 'demo-relative-range-v1';
export const demoBands = {
  low: { label: 'Rendah', symbol: '●', color: '#268963' },
  medium: { label: 'Sederhana', symbol: '◆', color: '#e4bd43' },
  high: { label: 'Tinggi', symbol: '▲', color: '#d24b5c' },
} as const;
export type DemoBand = keyof typeof demoBands;
export function demoRange(values: (number | null)[]) {
  const valid = values.filter((n): n is number => n !== null && Number.isFinite(n) && n > 0);
  if (valid.length < 2) return null;
  const min = Math.min(...valid),
    max = Math.max(...valid);
  if (min === max) return null;
  return { min, max, lowMax: min + (max - min) / 3, mediumMax: min + (2 * (max - min)) / 3 };
}
export function demoBand(
  value: number | null,
  range: ReturnType<typeof demoRange>,
): DemoBand | null {
  if (!range || value === null || !Number.isFinite(value) || value <= 0) return null;
  if (value <= range.lowMax) return 'low';
  if (value <= range.mediumMax) return 'medium';
  return 'high';
}
