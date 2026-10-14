import type { PoolClient } from 'pg';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  annualCode,
  annualDefinitions,
  annualCatalog,
  validateAnnual,
} from '../src/lib/domain/annual';

// Caller owns the transaction. A conflict must match exactly; immutable rows are never overwritten.
export async function ingestAnnual(c: PoolClient, input: unknown) {
  const manifest = validateAnnual(input);
  const extract = await readFile('data/supplied/annual-bmd-2025.json');
  if (
    createHash('sha256').update(extract).digest('hex') !== annualCatalog.manifestHash ||
    JSON.stringify(input) !== JSON.stringify(JSON.parse(extract.toString('utf8')))
  )
    throw new Error('Reconciled extraction checksum mismatch.');
  const source = await readFile('data/Laporan-Buku-Dadah-2025.pdf');
  if (createHash('sha256').update(source).digest('hex') !== manifest.sourceHash)
    throw new Error('PDF checksum mismatch.');
  await c.query("SELECT pg_advisory_xact_lock(hashtext('annual-bmd-2025-v1'))");
  for (const d of annualDefinitions) {
    await c.query(
      'INSERT INTO core.indicator(code,version,teras,effective_from,definition) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [d.code, d.version, d.teras, d.effectiveFrom, d],
    );
    const old = await c.query(
      'SELECT definition=$3::jsonb AS matches FROM core.indicator WHERE code=$1 AND version=$2',
      [d.code, d.version, d],
    );
    if (!old.rows[0]?.matches) throw new Error('Immutable annual definition conflict.');
  }
  let inserted = 0,
    observations = 0;
  const publications = new Set<string>();
  for (const table of manifest.tables)
    for (const row of table.rows) {
      const publication = `bmd2025-${manifest.sourceHash.slice(0, 12)}-t${table.teras}-${row.year}-v1`;
      if (!publications.has(publication)) {
        const reason = `BMD annual source extract · SHA-256 ${manifest.sourceHash} · not an official platform publication`;
        await c.query(
          "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,reason,created_by) VALUES($1,'shared','MY',$2,'supplied',false,1,'bmd-v1',$3,$4,'annual-source-reconciliation') ON CONFLICT DO NOTHING",
          [publication, table.teras, `${row.year}-12-31`, reason],
        );
        const old = await c.query(
          "SELECT organisation='shared' AND geography='MY' AND teras=$2 AND origin='supplied' AND official=false AND version=1 AND definition_version='bmd-v1' AND period=$3::date AND reason=$4 AND created_by='annual-source-reconciliation' AND submission_id IS NULL AND predecessor IS NULL AS matches FROM core.publication WHERE id=$1",
          [publication, table.teras, `${row.year}-12-31`, reason],
        );
        if (!old.rows[0]?.matches) throw new Error('Immutable annual publication conflict.');
        publications.add(publication);
      }
      for (const [column, value] of Object.entries(row.values)) {
        const code = annualCode(table.id, column),
          unit = row.unit ?? table.columns.find((c) => c.key === column)!.unit;
        const sourceKey = `${table.id}:${row.year}:${row.label}:${column}`;
        const id = `bmd-${createHash('sha256').update(`${manifest.sourceHash}:${sourceKey}`).digest('hex')}`;
        const metadata = {
          table: table.id,
          label: row.label,
          column,
          sourcePage: row.columnPages?.[column] ?? row.page,
          sourceHash: manifest.sourceHash,
          refreshed: '2026-10-07',
          origin: 'supplied',
          cadence: 'annual',
          confidence:
            'Reconciled source extract; operational definitions and ownership require validation',
          comparisonBreak: table.comparisonBreak ?? null,
        };
        const result = await c.query(
          "INSERT INTO supplied.observation(id,code,definition_version,publication_id,organisation,geography,teras,period,value,state,unit,boundary_version,source,source_key,metadata) VALUES($1,$2,'bmd-v1',$3,'shared',$4,$5,$6,$7,$8,$9,'bmd-state-labels-unvalidated',$10,$11,$12) ON CONFLICT DO NOTHING",
          [
            id,
            code,
            publication,
            row.geography,
            table.teras,
            `${row.year}-12-31`,
            value,
            value === null ? 'unknown' : 'value',
            unit,
            'AADK · Buku Maklumat Dadah 2025',
            sourceKey,
            metadata,
          ],
        );
        inserted += result.rowCount ?? 0;
        const check = await c.query(
          "SELECT code=$2 AND publication_id=$3 AND geography=$4 AND teras=$5 AND period=$6::date AND value IS NOT DISTINCT FROM $7::numeric AND state=$8 AND unit=$9 AND metadata=$10::jsonb AND organisation='shared' AND definition_version='bmd-v1' AND boundary_version='bmd-state-labels-unvalidated' AND source='AADK · Buku Maklumat Dadah 2025' AND source_key=$11 AND sensitivity='public-aggregate' AND denominator IS NULL AS matches FROM supplied.observation WHERE id=$1",
          [
            id,
            code,
            publication,
            row.geography,
            table.teras,
            `${row.year}-12-31`,
            value,
            value === null ? 'unknown' : 'value',
            unit,
            metadata,
            sourceKey,
          ],
        );
        if (!check.rows[0]?.matches) throw new Error('Immutable annual observation conflict.');
        observations++;
      }
    }
  return {
    inserted,
    observations,
    publications: publications.size,
    sourceHash: manifest.sourceHash,
  };
}
