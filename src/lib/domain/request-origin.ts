export function isLocalSameOrigin(request: Request): boolean {
  const host = request.headers.get('host');
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  return request.headers.get('origin') === `${new URL(request.url).protocol}//${host}`;
}

/** Explicit host gate for the existing hosted demo; never wildcard vercel.app. */
export function isAllowedHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const name = host.toLowerCase().replace(/:\d+$/, '');
  if (['localhost', '127.0.0.1', '[::1]'].includes(name)) return true;
  const published = (process.env.PUBLIC_DEMO_HOST ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!published.length) return false;
  // Vercel sets this server-side to this deployment's own hostname. A configured
  // hosted demo can therefore serve its exact preview URL as well as its alias.
  if (process.env.VERCEL === '1' && process.env.VERCEL_URL)
    published.push(process.env.VERCEL_URL.toLowerCase());
  return published.includes(name);
}

export function isAllowedSameOrigin(request: Request): boolean {
  if (isLocalSameOrigin(request)) return true;
  const host = request.headers.get('host');
  if (!isAllowedHost(host)) return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === 'https:' &&
      parsed.origin === origin &&
      parsed.host.toLowerCase() === host!.toLowerCase()
    );
  } catch {
    return false;
  }
}
