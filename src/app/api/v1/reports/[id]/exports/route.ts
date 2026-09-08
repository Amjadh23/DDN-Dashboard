import { mutation } from '@/lib/server/api';
import { generateReportExport } from '@/lib/server/reports';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutation(request, async (session) => ({
    export: await generateReportExport(session, (await params).id, await request.json()),
  }));
}
