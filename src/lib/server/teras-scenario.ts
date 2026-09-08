import 'server-only';
import { allowed, type Session } from '../domain/policy';
import type { Filters } from '../domain/filters';
import { stateNames } from '../domain/demo-identities';
export function getScenario(session: Session, teras: number, filters: Filters) {
  const geography = filters.geography;
  if (
    filters.source === 'supplied' ||
    filters.organisation === 'demo-b' ||
    !allowed(session, 'view', {
      organisation: 'demo-a',
      geography,
      teras,
      sensitivity: 'demo',
      state: 'published',
    })
  )
    return null;
  const factor =
    filters.geography === 'MY' ? 1 : (Object.keys(stateNames).indexOf(geography) + 8) / 100;
  const periodFactor = filters.period === '2026-08-02' ? 0.94 : 1;
  return {
    factor: factor * periodFactor,
    scope: filters.geography === 'MY' ? 'Senario kebangsaan' : stateNames[geography],
    value: (n: number) => Math.round(n * factor * periodFactor),
    period: filters.period,
    synthetic: true as const,
  };
}
