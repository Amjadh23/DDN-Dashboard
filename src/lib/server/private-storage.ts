import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(
  process.env.PRIVATE_STORAGE_ROOT ??
    (process.env.VERCEL ? '/tmp/ddn-private' : '.runtime/private'),
);
function storagePath(id: string) {
  if (!/^[a-z0-9-]{1,100}$/.test(id)) throw new Error('Kunci objek tidak sah.');
  return path.join(root, `${id}.enc`);
}
function key() {
  if (!process.env.SESSION_SECRET) throw new Error('Storan belum dikonfigurasi.');
  return createHash('sha256').update(`private-storage-v1:${process.env.SESSION_SECRET}`).digest();
}
export async function writePrivate(id: string, bytes: Buffer) {
  await mkdir(root, { recursive: true });
  const iv = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key(), iv),
    encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
  await writeFile(storagePath(id), Buffer.concat([iv, cipher.getAuthTag(), encrypted]), {
    flag: 'wx',
  });
}
export async function readPrivate(id: string) {
  const data = await readFile(storagePath(id));
  const decipher = createDecipheriv('aes-256-gcm', key(), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]);
}
export async function boundedBody(request: Request, maxBytes = 2 * 1024 * 1024) {
  const size = Number(request.headers.get('content-length'));
  if (Number.isFinite(size) && size > maxBytes) throw new Error('Fail melebihi had 2 MB.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Fail kosong.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error('Fail melebihi had 2 MB.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!total) throw new Error('Fail kosong.');
  return Buffer.concat(chunks);
}
