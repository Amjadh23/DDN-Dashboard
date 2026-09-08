export const actionLabels: Record<string, string> = {
  open: 'Terbuka',
  'in-progress': 'Dalam tindakan',
  review: 'Menunggu pengesahan',
  closed: 'Ditutup & disahkan',
};
export function nextActionState(
  row: {
    status: string;
    revision: number;
    owner: string;
    evidence: string | null;
    evidenceBy: string | null;
  },
  next: string,
  revision: number,
  actor: string,
) {
  if (revision !== row.revision) throw new Error('Versi tindakan telah berubah. Muat semula.');
  const transitions: Record<string, string[]> = {
    open: ['in-progress'],
    'in-progress': ['review'],
    review: ['in-progress', 'closed'],
    closed: [],
  };
  if (!transitions[row.status]?.includes(next))
    throw new Error('Peralihan tindakan tidak dibenarkan.');
  if (['review', 'closed'].includes(next) && (!row.evidence || row.evidence.trim().length < 3))
    throw new Error('Bukti diperlukan untuk semakan dan penutupan.');
  if (next === 'closed' && (actor === row.owner || actor === row.evidenceBy))
    throw new Error('Pengesah berasingan daripada pemilik dan penulis bukti diperlukan.');
  return next;
}
