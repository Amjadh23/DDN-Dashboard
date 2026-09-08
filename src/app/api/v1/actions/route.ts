import { mutation } from '@/lib/server/api';
import { addDecision } from '@/lib/server/collaboration';
export async function POST(request: Request) {
  return mutation(request, async (s) => addDecision(s, await request.json()));
}
