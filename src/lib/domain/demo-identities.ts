import type { Role, Session } from './policy';
export const roleLabels: Record<Role, string> = {
  executive: 'Eksekutif',
  analyst: 'Penganalisis',
  contributor: 'Penyumbang',
  steward: 'Penjaga data',
  reviewer: 'Penyemak bebas',
  'programme-manager': 'Pengurus program',
  'restricted-analyst': 'Penganalisis terhad',
  secretariat: 'Sekretariat',
  auditor: 'Juruaudit',
  'organisation-admin': 'Pentadbir organisasi',
  'platform-admin': 'Pentadbir platform',
  'indicator-admin': 'Pentadbir indikator',
};
export const demoIdentities: Record<string, Omit<Session, 'expires'>> = Object.fromEntries(
  Object.entries(roleLabels).map(([role, label]) => [
    role,
    {
      id: `demo-${role}`,
      name: `${label} Demo`,
      role: role as Role,
      organisation: ['executive', 'analyst', 'auditor', 'secretariat', 'platform-admin'].includes(
        role,
      )
        ? '*'
        : 'demo-a',
      geographies: ['*'],
      teras: [1, 2, 3, 4, 5],
      sensitivity: ['demo', 'public-aggregate'],
    },
  ]),
);
export const stateNames: Record<string, string> = {
  'MY-01': 'Johor',
  'MY-02': 'Kedah',
  'MY-03': 'Kelantan',
  'MY-04': 'Melaka',
  'MY-05': 'Negeri Sembilan',
  'MY-06': 'Pahang',
  'MY-07': 'Pulau Pinang',
  'MY-08': 'Perak',
  'MY-09': 'Perlis',
  'MY-10': 'Selangor',
  'MY-11': 'Terengganu',
  'MY-12': 'Sabah',
  'MY-13': 'Sarawak',
  'MY-14': 'W.P. Kuala Lumpur',
  'MY-15': 'W.P. Labuan',
  'MY-16': 'W.P. Putrajaya',
};
