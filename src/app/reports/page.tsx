import { getSession } from '@/lib/server/auth';
import { getSavedReports, getReportExports } from '@/lib/server/reports';
import { parseFilters } from '@/lib/domain/filters';
import { PageHeading } from '@/components/ui';
import { ReportsWorkspace } from '@/components/reports-workspace';
export const metadata = { title: 'Laporan & paparan tersimpan' };
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const [saved, exports] = await Promise.all([getSavedReports(session), getReportExports(session)]);
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="PELAPORAN / JEJAK BUKTI"
        title="Laporan & paparan tersimpan"
        description="Bekukan paparan terdedah bersama penapis, sumber dan versi penerbitan untuk rujukan semula."
      />
      <ReportsWorkspace
        saved={saved}
        exports={exports}
        filters={parseFilters(await searchParams)}
      />
    </div>
  );
}
