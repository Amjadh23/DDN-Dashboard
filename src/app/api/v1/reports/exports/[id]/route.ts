import { getSession } from '@/lib/server/auth';
import { privateJSON } from '@/lib/server/api';
import { downloadReportExport } from '@/lib/server/reports';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const file = await downloadReportExport(await getSession(), (await params).id);
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return privateJSON({ error: 'Akses ditolak.' }, 403);
  }
}
