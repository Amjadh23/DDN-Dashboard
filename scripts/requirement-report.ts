import { readFile, writeFile } from 'node:fs/promises';
const spec = await readFile('SPEC.md', 'utf8');
const ids = [...spec.matchAll(/^- \*\*([A-Z]+(?:-T[1-5])?-\d+)[^*]*\*\*/gm)].map((m) => m[1]);
const proven = new Set(
  `FR-001 FR-002 FR-003 FR-004 FR-005 FR-006 FR-007 FR-008 FR-021 FR-023 FR-024 FR-025 FR-026 FR-027 FR-041 FR-042 FR-051 FR-052 FR-054 FR-055 SEC-001 SEC-003 SEC-004 SEC-005 SEC-011 SEC-014 SEC-015 SEC-016 DATA-001 DATA-003 DATA-004 DATA-005 DATA-010 DATA-011 DATA-020 DATA-023 DATA-030 DATA-031 DATA-033 DATA-042 DATA-043 DATA-044 DATA-045 MAP-001 MAP-003 MAP-014 MAP-020 MAP-022 MAP-023 MAP-027 MAP-028 MAP-029 MAP-030 MAP-031 MAP-032 WF-001 WF-002 WF-003 WF-005 WF-006 WF-007 WF-008 WF-009 WF-010 WF-011 NFR-001 NFR-002 NFR-003 NFR-004 NFR-006 NFR-007 NFR-010 NFR-011 NFR-012 NFR-021 NFR-022 NFR-023 NFR-028 FR-T1-008 FR-T2-010 FR-T3-009 FR-T4-008 FR-T5-009 DATA-T2-002 DATA-T3-002 DATA-T4-002 DATA-T5-002 VIS-T2-001 VIS-T3-001 VIS-T5-001 ACC-001 ACC-002 ACC-003 ACC-004 ACC-005 ACC-008 ACC-010 ACC-021 ACC-022 ACC-023 ACC-024 ACC-026 ACC-030`.split(
    ' ',
  ),
);
const gated = new Set(
  `MAP-002 MAP-010 MAP-011 MAP-012 MAP-013 MAP-021 FR-T2-006 FR-T2-008 FR-T3-008 FR-T4-006 FR-053 FR-057 SEC-019`.split(
    ' ',
  ),
);
function evidence(id: string) {
  if (/T[1-5]/.test(id))
    return '`src/components/teras-content.tsx`, `src/app/teras/[id]/page.tsx`, source reconciliation and Teras browser tests';
  if (id.startsWith('MAP'))
    return '`src/components/threat-map.tsx`, scoped DAL, semantics and map browser tests';
  if (id.startsWith('WF') || /^DATA-0(3|4)/.test(id))
    return 'Upload contracts, isolated worker, workflow/collaboration DAL and browser tests';
  if (id.startsWith('SEC'))
    return 'Policy/auth/DAL, PostgreSQL constraints/RLS, negative access and export-revocation tests';
  if (id.startsWith('DATA'))
    return 'Domain registry/semantics, migrations, seed and source reconciliation tests';
  if (/^FR-05/.test(id))
    return 'Reports DAL, CSV/XLSX generation, actor-bound download and browser tests';
  return 'Implementation and validation evidence in `docs/VALIDATION.md`; partial status is not acceptance';
}
const rows = ids.map(
  (id) =>
    `| ${id} | ${proven.has(id) ? 'Demonstrated locally' : gated.has(id) ? 'Deliberately gated / conditional' : 'Partial or acceptance evidence pending'} | ${evidence(id)} |`,
);
await writeFile(
  'docs/REQUIREMENT_STATUS.md',
  `# Requirement-by-requirement status\n\nGenerated from every stable requirement ID in SPEC.md. “Demonstrated locally” is evidence for the bounded synthetic prototype, not production approval or human acceptance. “Partial” explicitly does not mean complete. See VALIDATION.md for exact residual work and decisions. No requirement text has been changed.\n\n| Requirement | Status | Evidence / implementation |\n|---|---|---|\n${rows.join('\n')}\n`,
);
console.log(`Recorded ${ids.length} requirement IDs without changing SPEC.md.`);
