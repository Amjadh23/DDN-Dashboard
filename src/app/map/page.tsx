import { redirect } from 'next/navigation';

// Preserve old bookmarks and saved URLs without maintaining a second workspace.
export default async function LegacyMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  redirect(query.size ? `/?${query}` : '/');
}
