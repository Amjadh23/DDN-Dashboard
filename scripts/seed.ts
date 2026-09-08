import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { metricDefinitions, suppliedValues } from '../src/lib/domain/registry';
import { BOUNDARY, REFRESHED } from '../src/lib/domain/types';
import { stateNames } from '../src/lib/domain/demo-identities';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
const c = await pool.connect();
try {
  await c.query('BEGIN');
  for (const [id, name] of [
    ['shared', 'Agregat sumber dibekalkan'],
    ['demo-a', 'Pasukan Demo A'],
    ['demo-b', 'Pasukan Demo B'],
  ]) {
    await c.query(
      "INSERT INTO core.organisation VALUES($1,$2,$2,'2026-09-07',NULL,'demo','requires stakeholder validation') ON CONFLICT DO NOTHING",
      [id, name],
    );
  }
  for (const d of metricDefinitions)
    await c.query(
      'INSERT INTO core.indicator(code,version,teras,effective_from,definition) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [d.code, d.version, d.teras, d.effectiveFrom, d],
    );
  const geo = JSON.parse(await readFile('public/geo/malaysia-states-data.geojson', 'utf8'));
  for (const feature of geo.features) {
    await c.query(
      'INSERT INTO core.geography(id,name,boundary_version,source,geom) VALUES($1,$2,$3,$4,ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($5),4326))) ON CONFLICT DO NOTHING',
      [
        feature.properties.shapeISO,
        stateNames[feature.properties.shapeISO],
        BOUNDARY,
        'geoBoundaries / OpenStreetMap contributors · ODbL 1.0',
        JSON.stringify(feature.geometry),
      ],
    );
  }
  for (const kind of [
    'time',
    'population',
    'substance',
    'programme',
    'facility',
    'partner',
    'forum',
  ]) {
    await c.query(
      "INSERT INTO core.dimension(kind,id,version,name_bm,effective_from,metadata) VALUES($1,$2,'v1',$3,'2026-09-07',$4) ON CONFLICT DO NOTHING",
      [
        kind,
        `demo-${kind}`,
        `Rujukan demo: ${kind}`,
        { evidence: 'Proposed', synthetic: true, approval: 'Validation required' },
      ],
    );
  }
  for (const teras of [2, 3]) {
    await c.query(
      "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,reason,created_by) VALUES($1,'shared','MY',$2,'supplied',false,1,'v1','2026-08-09','Petikan dibekalkan; disemak secara visual pada PDF halaman 2. Bukan penerbitan rasmi platform.','source-reconciliation') ON CONFLICT DO NOTHING",
      [`supplied-t${teras}-v1`, teras],
    );
  }
  for (const { code, value } of suppliedValues) {
    const d = metricDefinitions.find((x) => x.code === code)!;
    await c.query(
      "INSERT INTO supplied.observation(id,code,definition_version,publication_id,organisation,geography,teras,period,value,state,unit,boundary_version,source,source_key,metadata) VALUES($1,$1,'v1',$2,'shared','MY',$3,'2026-08-09',$4,'value',$5,'national-snapshot',$6,$1,$7) ON CONFLICT DO NOTHING",
      [
        code,
        `supplied-t${d.teras}-v1`,
        d.teras,
        value,
        d.unit,
        d.source,
        {
          sourcePage: 2,
          refreshed: REFRESHED,
          confidence: 'Disemak kepada sumber; definisi operasi tertakluk pengesahan',
          origin: 'supplied',
        },
      ],
    );
  }
  // All values below are generated demonstration aggregates, never reported Malaysian population or workload.
  const populations = [
    2200000, 1300000, 1100000, 650000, 900000, 1200000, 1400000, 1800000, 250000, 3500000, 1050000,
    2400000, 2000000, 1600000, 90000, 120000,
  ];
  const burden = [
    2800, 2530, 2860, 455, 738, 1740, 1680, 2970, 0, 4725, 2520, 2520, 1800, 1360, 3, 0,
  ];
  const codes = ['D-BURDEN', 'D-SUPPLY', 'D-HARM', 'D-GAP', 'D-CONFIDENCE'];
  for (const period of ['2026-08-02', '2026-08-09'])
    for (const teras of [1, 2, 3, 4, 5]) {
      await c.query(
        "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,reason,created_by) VALUES($1,'demo-a','MY',$2,'synthetic',false,1,'v1',$3,'DEMO / SYNTHETIC · set senario v1','demo-generator') ON CONFLICT DO NOTHING",
        [`demo-t${teras}-${period}-v1`, teras, period],
      );
    }
  for (let i = 0; i < 16; i++)
    for (let l = 0; l < codes.length; l++)
      for (const period of ['2026-08-02', '2026-08-09']) {
        const code = codes[l],
          d = metricDefinitions.find((x) => x.code === code)!;
        const id = `MY-${String(i + 1).padStart(2, '0')}`;
        const now = period === '2026-08-09';
        const base =
          l === 0
            ? burden[i]
            : l === 1
              ? Math.round(burden[i] * 0.31 + (i % 3) * 90)
              : l === 2
                ? Math.round(burden[i] * 0.035 + (i % 4) * 8)
                : l === 3
                  ? Math.round(burden[i] * 0.22)
                  : 100 - (i % 5) * 7;
        const state =
          i === 15
            ? 'unknown'
            : i === 8 && l === 2
              ? 'not-collected'
              : i === 8 && l === 3
                ? 'not-applicable'
                : 'value';
        const value =
          state === 'value'
            ? now || l === 4
              ? base
              : Math.max(0, Math.round(base * (i % 2 === 0 ? 0.91 : 1.06)))
            : null;
        const sourceKey = `${code}-${id}-${period}`;
        await c.query(
          "INSERT INTO demo.observation(id,code,definition_version,publication_id,organisation,geography,teras,period,value,state,denominator,unit,boundary_version,source,source_key,metadata) VALUES($1,$2,'v1',$3,'demo-a',$4,$5,$6,$7,$8,$9,$10,$11,$12,$1,$13) ON CONFLICT DO NOTHING",
          [
            sourceKey,
            code,
            `demo-t${d.teras}-${period}-v1`,
            id,
            d.teras,
            period,
            value,
            state,
            l === 4 ? 100 : populations[i],
            l === 4 ? 'medan sah' : d.unit,
            BOUNDARY,
            'Penjana senario v1 · DEMO / SYNTHETIC',
            {
              origin: 'synthetic',
              refreshed: REFRESHED,
              coverage: 100 - (i % 5) * 7,
              denominatorSource: 'Populasi rekaan v1 · 2026 · DEMO / SYNTHETIC',
              drivers: [
                { label: 'Rekod dalam skop demo', value, unit: d.unit },
                { label: 'Kelengkapan medan demo', value: 100 - (i % 5) * 7, unit: '%' },
              ],
            },
          ],
        );
      }
  // Deliberately foreign partition ensures RLS tests contain rows to exclude.
  await c.query(
    "INSERT INTO demo.observation SELECT 'isolation-fixture',code,definition_version,publication_id,'demo-b','MY-01',teras,sensitivity,period,value,state,denominator,unit,boundary_version,source,'isolation-fixture',metadata,created_at FROM demo.observation WHERE code='D-BURDEN' LIMIT 1 ON CONFLICT DO NOTHING",
  );
  await c.query(
    "INSERT INTO core.action(id,organisation,geography,teras,title,owner,due_date,priority,status,context,created_by) VALUES('demo-action-01','demo-a','MY-03',1,'Semak jurang liputan program komuniti','demo-programme-manager','2026-09-18','high','in-progress',$1,'demo-executive'),('demo-action-02','demo-a','MY-10',2,'Sahkan kelengkapan susulan kohort demo','demo-steward','2026-09-21','normal','open',$2,'demo-executive'),('demo-action-03','demo-a','MY-12',4,'Selaraskan skop perkhidmatan kemudaratan','demo-secretariat','2026-09-25','normal','open',$3,'demo-executive') ON CONFLICT DO NOTHING",
    [
      {
        publication: 'demo-t1-2026-08-09-v1',
        definition: 'v1',
        layer: 'gap',
        period: '2026-08-09',
        synthetic: true,
      },
      {
        publication: 'demo-t2-2026-08-09-v1',
        definition: 'v1',
        period: '2026-08-09',
        synthetic: true,
      },
      {
        publication: 'demo-t4-2026-08-09-v1',
        definition: 'v1',
        period: '2026-08-09',
        synthetic: true,
      },
    ],
  );
  await c.query('COMMIT');
  console.log(
    'Seed verified: supplied headline aggregates, 16 demonstration geographies, two demonstration periods; no personal data.',
  );
} catch (error) {
  await c.query('ROLLBACK');
  throw error;
} finally {
  c.release();
  await pool.end();
}
