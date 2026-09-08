import ExcelJS from 'exceljs';
import { getSession, requirePermission } from '@/lib/server/auth';
import { templates, exampleRows, uploadColumns, uploadDictionary } from '@/lib/domain/uploads';
import { privateJSON } from '@/lib/server/api';
export async function GET(request: Request) {
  try {
    const p = new URL(request.url).searchParams,
      template = templates.find((t) => t.id === p.get('template'));
    if (!template) return privateJSON({ error: 'Templat tidak sah.' }, 400);
    const teras = template.teras ?? Number(p.get('teras') ?? 2),
      geography = p.get('geography') ?? 'MY-01',
      period = p.get('period') ?? '2026-08-09';
    const session = await getSession();
    requirePermission(session, 'view', {
      organisation: 'demo-a',
      geography,
      teras,
      sensitivity: 'demo',
      state: 'published',
    });
    if (
      !/^(MY|MY-(0[1-9]|1[0-6]))$/.test(geography) ||
      !['2026-08-09', '2026-08-02'].includes(period) ||
      teras < 1 ||
      teras > 5
    )
      return privateJSON({ error: 'Skop templat tidak sah.' }, 400);
    const rows = exampleRows(template.id, { teras, geography, period, organisation: 'demo-a' }),
      w = new ExcelJS.Workbook();
    w.creator = 'DDN prototype · DEMO / SYNTHETIC';
    const s = w.addWorksheet('Data');
    s.addRow(uploadColumns);
    for (const r of rows)
      s.addRow([
        r.schemaVersion,
        r.classification,
        r.sourceKey,
        r.organisation,
        r.geography,
        r.period,
        r.indicatorCode,
        r.unit,
        r.value,
        r.state,
        r.denominator,
      ]);
    s.columns.forEach((c) => {
      c.width = 23;
    });
    s.getRow(1).font = { bold: true };
    const info = w.addWorksheet('Instructions');
    info.addRows([
      ['DEMO / SYNTHETIC', 'Skema 1.0 · Proposed'],
      ['Pemilik', 'Pasukan Demo A · requires stakeholder validation'],
      ['Arahan', 'Sunting lembaran Data sahaja; tiada identiti, formula, makro atau pautan luar.'],
      ['Had', '2 MB; 1,000 baris. Skop dan unit mesti sepadan.'],
      ...uploadDictionary.map((d) => [d.column, d.instruction]),
    ]);
    info.getColumn(1).width = 25;
    info.getColumn(2).width = 90;
    return new Response(new Uint8Array(await w.xlsx.writeBuffer()), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="demo-${template.id}-v1.xlsx"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return privateJSON({ error: 'Templat tidak tersedia dalam skop ini.' }, 403);
  }
}
