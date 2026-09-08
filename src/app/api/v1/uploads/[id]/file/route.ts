import { mutation } from '@/lib/server/api';
import { acceptUpload } from '@/lib/server/workflow';
import { boundedBody } from '@/lib/server/private-storage';
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutation(request, async (session) =>
    acceptUpload(
      session,
      (await params).id,
      request.headers.get('x-upload-token') ?? '',
      await boundedBody(request),
    ),
  );
}
