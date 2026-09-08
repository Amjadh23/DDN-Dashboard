import { mutation } from '@/lib/server/api';
import { updateAction } from '@/lib/server/collaboration';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutation(request, async (s) => updateAction(s, (await params).id, await request.json()));
}
