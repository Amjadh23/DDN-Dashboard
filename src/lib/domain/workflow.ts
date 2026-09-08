import { allowed, type Resource, type Session, type WorkflowState } from './policy';
export interface WorkflowRecord extends Resource {
  revision: number;
  scanStatus: string;
  errors: number;
  warnings: number;
}
export interface TransitionInput {
  operation: 'submit' | 'approve' | 'reject' | 'publish';
  revision: number;
  reason: string;
  attestation?: boolean;
}
export function transitionSubmission(
  session: Session,
  row: WorkflowRecord,
  input: TransitionInput,
): WorkflowState {
  if (input.revision !== row.revision)
    throw new Error('Versi telah berubah. Muat semula sebelum meneruskan.');
  if (input.reason.trim().length < 3) throw new Error('Sebab atau justifikasi perlu direkodkan.');
  const permission = input.operation === 'reject' ? 'approve' : input.operation;
  if (!allowed(session, permission, row))
    throw new Error('Akses ditolak untuk peranan, skop atau keadaan ini.');
  if (input.operation === 'submit') {
    if (row.scanStatus !== 'clean' || row.errors > 0)
      throw new Error('Imbasan bersih dan penyelesaian semua ralat diperlukan.');
    if (!input.attestation) throw new Error('Pengesahan sumber, liputan dan kualiti diperlukan.');
    return 'submitted';
  }
  return input.operation === 'approve'
    ? 'approved'
    : input.operation === 'reject'
      ? 'rejected'
      : 'published';
}
export const workflowLabels: Record<WorkflowState, string> = {
  draft: 'Sasaran muat naik',
  quarantined: 'Dalam kuarantin',
  validating: 'Sedang disahkan',
  invalid: 'Perlu pembetulan',
  validated: 'Sedia untuk pengesahan',
  submitted: 'Menunggu semakan',
  rejected: 'Ditolak penyemak',
  approved: 'Diluluskan',
  published: 'Diterbitkan',
};
