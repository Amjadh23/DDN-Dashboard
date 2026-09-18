import { notFound, redirect } from 'next/navigation';
import { terasInfo } from '@/lib/domain/teras';
import { TerasView } from '@/components/teras-view';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: terasInfo[Number(id)]?.title ?? 'Teras' };
}

export default async function TerasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params,
    teras = Number(id);
  if (!Number.isInteger(teras) || teras < 1 || teras > 5) notFound();
  const p = await searchParams;
  // Pendidikan pencegahan now lives on the national overview.
  if (teras === 1) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(p)) {
      if (typeof value === 'string') query.set(key, value);
      else if (Array.isArray(value) && value[0] !== undefined) query.set(key, value[0]);
    }
    const search = query.toString();
    redirect(`/${search ? `?${search}` : ''}#pendidikan-pencegahan`);
  }
  return <TerasView teras={teras} p={p} />;
}
