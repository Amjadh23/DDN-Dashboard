import { notFound, redirect } from 'next/navigation';
import { isDomain, legacyTerasHref } from '@/lib/domain/pillars';
export default async function LegacyTeras({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params,
    domain = Number(id);
  if (!isDomain(domain) || String(domain) !== id) notFound();
  redirect(legacyTerasHref(domain, await searchParams));
}
