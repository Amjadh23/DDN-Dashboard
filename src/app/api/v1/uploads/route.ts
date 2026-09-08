import { getSession } from '@/lib/server/auth';
import { mutation, privateJSON } from '@/lib/server/api';
import { createUploadTarget, getSubmissions } from '@/lib/server/workflow';
export async function GET() {
  try {
    return privateJSON({ submissions: await getSubmissions(await getSession()) });
  } catch {
    return privateJSON({ error: 'Akses ditolak.' }, 403);
  }
}
export async function POST(request: Request) {
  return mutation(request, async (session) => createUploadTarget(session, await request.json()));
}
