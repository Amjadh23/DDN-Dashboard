export function rate(value: number | null, denominator: number | null): number | null {
  if (
    value === null ||
    denominator === null ||
    !Number.isFinite(value) ||
    !Number.isFinite(denominator) ||
    denominator <= 0 ||
    value < 0
  )
    return null;
  return (value / denominator) * 100_000;
}
export function periodChange(current: number | null, previous: number | null): number | null {
  if (
    current === null ||
    previous === null ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous <= 0
  )
    return null;
  return Math.round(((current - previous) / previous) * 10_000) / 100;
}
interface Comparable {
  value: number | null;
  definition: string;
  boundary: string;
  coverage: string;
  cohort: string;
}
export function compareObservations(current: Comparable, previous: Comparable): number | null {
  if (
    current.definition !== previous.definition ||
    current.boundary !== previous.boundary ||
    current.coverage !== previous.coverage ||
    current.cohort !== previous.cohort
  )
    return null;
  return periodChange(current.value, previous.value);
}
/** Apply to the entire authorised partition before filtering. Never expose a reconstructible total. */
export function disclose(values: (number | null)[], minimum: number): (number | null)[] {
  const primary = values.some((v) => v !== null && v > 0 && v < minimum);
  const result = values.map((v) => (v !== null && v > 0 && v < minimum ? null : v));
  if (primary) {
    const candidates = result
      .map((v, i) => ({ v, i }))
      .filter((x): x is { v: number; i: number } => x.v !== null && x.v > 0)
      .sort((a, b) => a.v - b.v);
    if (candidates.length) result[candidates[0].i] = null;
  }
  return result;
}
interface Rule {
  status: 'approved' | 'unapproved' | 'demo';
  synthetic: boolean;
  bands: [number, number, number];
}
/** No production rule is configured. This evaluator cannot approve or invent a rule. */
export function classify(value: number | null, rule: Rule): string {
  if (value === null || !Number.isFinite(value)) return 'no-data';
  if (rule.status !== 'approved' && !(rule.status === 'demo' && rule.synthetic))
    return 'unclassified';
  if (rule.bands.some((v, i) => !Number.isFinite(v) || (i > 0 && v <= rule.bands[i - 1])))
    return 'unclassified';
  if (value < rule.bands[0]) return 'low';
  if (value < rule.bands[1]) return 'moderate';
  if (value < rule.bands[2]) return 'elevated';
  return 'high';
}
/** Demonstration completeness-profile mean only; no official confidence weights are approved. */
export function confidence(components: (number | null)[]): number | null {
  if (
    components.length !== 6 ||
    components.some((v) => v === null || !Number.isFinite(v) || v < 0 || v > 100)
  )
    return null;
  return Math.round(components.reduce<number>((a, v) => a + (v ?? 0), 0) / components.length);
}
export function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
