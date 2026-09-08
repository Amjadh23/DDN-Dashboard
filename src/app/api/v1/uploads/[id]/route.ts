import { mutation } from '@/lib/server/api';
import { changeSubmission, retryValidation } from '@/lib/server/workflow';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutation(request, async (session) => {
    const { id } = await params;
    const input = await request.json();
    return input.operation === 'retry'
      ? retryValidation(session, id)
      : changeSubmission(session, id, input);
  });
}
