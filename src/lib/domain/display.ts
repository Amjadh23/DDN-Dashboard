import { demoIdentities, stateNames } from './demo-identities';

const labels: Record<string, string> = {
  Available: 'Data dibekalkan',
  Derived: 'Dikira',
  Policy: 'Dasar',
  Proposed: 'Cadangan',
  'Validation required': 'Perlu pengesahan',
  'explicitly assigned': 'Ditetapkan dalam dasar',
  'policy-listed': 'Disenaraikan dalam dasar',
  'functionally inferred': 'Berdasarkan fungsi',
  'requires stakeholder validation': 'Perlu pengesahan pihak berkepentingan',
  published: 'Diterbitkan',
  open: 'Terbuka',
  'in-progress': 'Dalam tindakan',
  closed: 'Ditutup',
  review: 'Menunggu pengesahan',
  pending: 'Menunggu',
  running: 'Sedang diproses',
  complete: 'Selesai',
  failed: 'Gagal',
  'dead-letter': 'Perlu semakan',
  'public-aggregate': 'Agregat dibekalkan',
  supplied: 'Data dibekalkan',
  synthetic: 'DEMO / SYNTHETIC',
  organisation: 'Organisasi',
  programme: 'Program',
  facility: 'Fasiliti',
  partner: 'Rakan',
  forum: 'Forum',
};
export const displayLabel = (value: string) => labels[value] ?? value;
export const actorName = (value: string) =>
  Object.values(demoIdentities).find((p) => p.id === value)?.name ?? value;
export const geographyName = (value: string) =>
  value === 'MY'
    ? 'Seluruh Malaysia'
    : value === '*'
      ? 'Semua geografi'
      : (stateNames[value] ?? value);
export const organisationName = (value: string) =>
  ({ 'demo-a': 'Pasukan Demo A', 'demo-b': 'Pasukan Demo B', shared: 'Sumber dibekalkan' })[
    value
  ] ?? value;
