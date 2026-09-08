export type Role =
  | 'executive'
  | 'analyst'
  | 'contributor'
  | 'steward'
  | 'reviewer'
  | 'programme-manager'
  | 'restricted-analyst'
  | 'secretariat'
  | 'auditor'
  | 'organisation-admin'
  | 'platform-admin'
  | 'indicator-admin';
export type Permission =
  | 'view'
  | 'upload'
  | 'submit'
  | 'approve'
  | 'publish'
  | 'export'
  | 'comment'
  | 'action'
  | 'audit'
  | 'administer';
export type Sensitivity = 'public-aggregate' | 'demo' | 'restricted';
export type WorkflowState =
  | 'draft'
  | 'quarantined'
  | 'validating'
  | 'invalid'
  | 'validated'
  | 'submitted'
  | 'rejected'
  | 'approved'
  | 'published';
export interface Session {
  id: string;
  name: string;
  role: Role;
  organisation: string;
  geographies: string[];
  teras: number[];
  sensitivity: Sensitivity[];
  expires: number;
}
export interface Resource {
  organisation: string;
  geography: string;
  teras: number;
  sensitivity: Sensitivity;
  state: WorkflowState;
  submitter?: string;
}
const grants: Record<Role, readonly Permission[]> = {
  executive: ['view', 'comment', 'action'],
  analyst: ['view', 'export', 'comment', 'action'],
  contributor: ['view', 'upload', 'comment'],
  steward: ['view', 'upload', 'submit', 'comment'],
  reviewer: ['view', 'approve', 'comment'],
  'programme-manager': ['view', 'comment', 'action'],
  'restricted-analyst': ['view', 'export', 'comment'],
  secretariat: ['view', 'publish', 'export', 'comment', 'action'],
  auditor: ['view', 'audit'],
  'organisation-admin': ['administer'],
  'platform-admin': ['administer'],
  'indicator-admin': ['view', 'administer'],
};
export function allowed(
  session: Session | null,
  permission: Permission,
  resource: Resource,
): boolean {
  if (!session || session.expires <= Date.now() || !grants[session.role]?.includes(permission))
    return false;
  if (
    !session.sensitivity.includes(resource.sensitivity) ||
    !session.teras.includes(resource.teras)
  )
    return false;
  if (
    session.organisation !== '*' &&
    session.organisation !== resource.organisation &&
    resource.organisation !== 'shared'
  )
    return false;
  if (!session.geographies.includes('*') && !session.geographies.includes(resource.geography))
    return false;
  if (
    permission === 'approve' &&
    (resource.submitter === session.id || resource.state !== 'submitted')
  )
    return false;
  if (permission === 'publish' && resource.state !== 'approved') return false;
  if (permission === 'submit' && resource.state !== 'validated') return false;
  if (permission === 'export' && resource.state !== 'published') return false;
  if (
    permission === 'view' &&
    ['executive', 'analyst', 'programme-manager', 'restricted-analyst'].includes(session.role) &&
    resource.state !== 'published'
  )
    return false;
  return true;
}
