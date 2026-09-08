import { mutation } from '@/lib/server/api';
import { changeGovernance } from '@/lib/server/governance';
export async function POST(request: Request) {
  return mutation(request, async (s) => changeGovernance(s, await request.json()));
}
