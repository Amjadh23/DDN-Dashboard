import { redirect } from 'next/navigation';

// The strategic map now lives on the national overview. This route is kept so
// existing links and bookmarks continue to work, carrying their filters over.
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) params.set(key, value[0]);
  }
  const query = params.toString();
  redirect(query ? `/?${query}` : '/');
}
