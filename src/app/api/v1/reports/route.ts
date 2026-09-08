import { getSession } from '@/lib/server/auth';
import { mutation, privateJSON } from '@/lib/server/api';
import { getReportExports, getSavedReports, saveReport } from '@/lib/server/reports';

export async function GET() {
  try {
    const session = await getSession();
    const [savedViews, exports] = await Promise.all([
      getSavedReports(session),
      getReportExports(session),
    ]);
    return privateJSON({ savedViews, exports });
  } catch {
    return privateJSON({ error: 'Akses ditolak.' }, 403);
  }
}
export async function POST(request: Request) {
  return mutation(request, async (session) => {
    const input = (await request.json()) as { title?: unknown; filters?: unknown };
    return { savedView: await saveReport(session, input) };
  });
}
