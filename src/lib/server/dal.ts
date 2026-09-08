import 'server-only';
import { withScope } from './db';
import { allowed, type Session } from '../domain/policy';
import { metricDefinitions } from '../domain/registry';
import type { Filters } from '../domain/filters';
import type { MapZoneDTO, MetricDTO, DataState, MetricDefinition } from '../domain/types';
import { disclose, compareObservations, rate } from '../domain/semantics';
import { stateNames } from '../domain/demo-identities';

export async function getMetrics(session: Session, filters: Filters): Promise<MetricDTO[]> {
  return withScope(session, async (c) => {
    if (filters.source === 'synthetic') return [];
    const result = await c.query(
      "SELECT o.code,o.value,o.state,o.period::text,o.publication_id,o.metadata FROM supplied.observation o WHERE o.period=$1 AND ($2='MY' OR o.geography=$2) AND $3='all' ORDER BY o.code",
      [filters.period, filters.geography, filters.organisation],
    );
    return result.rows.flatMap((row) => {
      const definition = metricDefinitions.find((d) => d.code === row.code)!;
      if (
        !allowed(session, 'view', {
          organisation: 'shared',
          geography: 'MY',
          teras: definition.teras,
          sensitivity: 'public-aggregate',
          state: 'published',
        })
      )
        return [];
      return [
        {
          definition,
          value: row.value === null ? null : Number(row.value),
          state: row.state,
          period: row.period,
          refreshed: row.metadata.refreshed,
          previous: null,
          confidence: row.metadata.confidence,
          publication: row.publication_id,
        },
      ];
    });
  });
}
export async function getMapZones(session: Session, filters: Filters): Promise<MapZoneDTO[]> {
  if (filters.source === 'supplied') return [];
  const code = {
    burden: 'D-BURDEN',
    supply: 'D-SUPPLY',
    harm: 'D-HARM',
    gap: 'D-GAP',
    confidence: 'D-CONFIDENCE',
  }[filters.layer];
  return withScope(session, async (c) => {
    const result = await c.query(
      "SELECT DISTINCT ON(o.geography,o.period,o.organisation) o.code,o.definition_version,o.value,o.state,o.denominator,o.organisation,o.geography,o.teras,o.period::text,o.publication_id,o.boundary_version,o.source,o.metadata FROM demo.observation o WHERE o.code=$1 AND ($2='all' OR o.organisation=$2) AND o.period IN ($3::date,$4::date) AND o.id<>'isolation-fixture' ORDER BY o.geography,o.period,o.organisation,o.created_at DESC,o.id DESC",
      [
        code,
        filters.organisation,
        filters.period,
        filters.compare === 'none' ? filters.period : filters.compare,
      ],
    );
    const rows = result.rows.filter((row) =>
      allowed(session, 'view', {
        organisation: row.organisation,
        geography: row.geography,
        teras: row.teras,
        sensitivity: 'demo',
        state: 'published',
      }),
    );
    const current = rows.filter((r) => r.period === filters.period);
    const prior = rows.filter((r) => r.period === filters.compare);
    const disclosed = disclose(
      current.map((r) => (r.value === null ? null : Number(r.value))),
      5,
    );
    const previous = disclose(
      prior.map((r) => (r.value === null ? null : Number(r.value))),
      5,
    );
    return current
      .map((row, i) => {
        const oldIndex = prior.findIndex((p) => p.geography === row.geography);
        const priorSuppressed =
          oldIndex >= 0 && prior[oldIndex].value !== null && previous[oldIndex] === null;
        const suppressed = (row.value !== null && disclosed[i] === null) || priorSuppressed;
        const count = suppressed ? null : disclosed[i],
          denominator = suppressed || row.denominator === null ? null : Number(row.denominator);
        const prev = suppressed || oldIndex < 0 ? null : previous[oldIndex];
        const state: DataState = suppressed ? 'suppressed' : row.state;
        return {
          id: row.geography,
          name: stateNames[row.geography],
          layer: filters.layer,
          count,
          denominator,
          rate: filters.layer === 'confidence' ? count : rate(count, denominator),
          previous: prev,
          change:
            oldIndex < 0
              ? null
              : compareObservations(
                  {
                    value: count,
                    definition: row.definition_version,
                    boundary: row.boundary_version,
                    coverage: row.metadata.coverage,
                    cohort: row.metadata.cohort,
                  },
                  {
                    value: prev,
                    definition: prior[oldIndex].definition_version,
                    boundary: prior[oldIndex].boundary_version,
                    coverage: prior[oldIndex].metadata.coverage,
                    cohort: prior[oldIndex].metadata.cohort,
                  },
                ),
          state,
          confidence: row.metadata.coverage,
          coverage: row.metadata.coverage,
          period: row.period,
          source: row.source,
          denominatorSource: row.metadata.denominatorSource,
          boundary: row.boundary_version,
          definition: row.definition_version,
          publication: row.publication_id,
          synthetic: true as const,
          drivers: suppressed ? [] : row.metadata.drivers,
        };
      })
      .filter(
        (row) =>
          (filters.geography === 'MY' || row.id === filters.geography) &&
          (filters.confidence === 'all' || row.coverage === 100),
      );
  });
}
export async function getRegistry(session: Session): Promise<MetricDefinition[]> {
  return metricDefinitions.filter((d) => session.teras.includes(d.teras));
}
export interface ActionDTO {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
  geography: string;
  teras: number;
  revision: number;
  evidence: string | null;
  evidenceBy: string | null;
  verifiedBy: string | null;
  organisation: string;
  createdAt: string;
  ageDays: number;
  context: Record<string, string | boolean>;
}
export async function getActions(session: Session): Promise<ActionDTO[]> {
  return withScope(session, async (c) => {
    const rows = await c.query(
      'SELECT id,title,owner,due_date::text,priority,status,geography,teras,revision,evidence,evidence_by,verified_by,created_at,context,organisation,GREATEST(0,FLOOR(EXTRACT(EPOCH FROM (now()-created_at))/86400))::int AS age_days FROM core.action ORDER BY due_date LIMIT 100',
    );
    return rows.rows
      .filter((r) =>
        allowed(session, 'view', {
          organisation: r.organisation,
          geography: r.geography,
          teras: r.teras,
          sensitivity: 'demo',
          state: 'published',
        }),
      )
      .map((r) => ({
        id: r.id,
        title: r.title,
        owner: r.owner,
        dueDate: r.due_date,
        priority: r.priority,
        status: r.status,
        geography: r.geography,
        teras: r.teras,
        revision: r.revision,
        evidence: r.evidence,
        evidenceBy: r.evidence_by,
        verifiedBy: r.verified_by,
        organisation: r.organisation,
        createdAt: r.created_at.toISOString(),
        ageDays: r.age_days,
        context: r.context,
      }));
  });
}
