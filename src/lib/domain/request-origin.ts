// The demonstration serves loopback hosts only, unless PUBLIC_DEMO_HOST names
// the host it is deployed on. Opening a deployment is therefore deliberate and
// limited to the hosts listed there, one per entry, comma separated.
const loopback = ['127.0.0.1', 'localhost', '[::1]'];

function hostname(host: string) {
  return host.replace(/:\d+$/, '').toLowerCase();
}
function published() {
  return (process.env.PUBLIC_DEMO_HOST ?? '')
    .split(',')
    .map((entry) => hostname(entry.trim()))
    .filter(Boolean);
}
export function isAllowedHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const name = hostname(host);
  return loopback.includes(name) || published().includes(name);
}
export function isAllowedSameOrigin(request: Request): boolean {
  const host = request.headers.get('host');
  if (!isAllowedHost(host)) return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    // Compare hosts rather than whole origins: a deployment behind TLS
    // termination sees an internal http:// request URL but an https:// Origin.
    return new URL(origin).host.toLowerCase() === host!.toLowerCase();
  } catch {
    return false;
  }
}
