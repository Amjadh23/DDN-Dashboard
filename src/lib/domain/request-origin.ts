export function isLocalSameOrigin(request: Request): boolean {
  const host = request.headers.get('host');
  if (!host || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  return request.headers.get('origin') === `${new URL(request.url).protocol}//${host}`;
}
