import { getSession } from '@/lib/server/auth';
import { getSubmissions } from '@/lib/server/workflow';
import { allowed } from '@/lib/domain/policy';
import { roleLabels } from '@/lib/domain/demo-identities';
import { PageHeading, DemoBadge } from '@/components/ui';
import { UploadWorkspace } from '@/components/upload-workspace';
export const metadata = { title: 'Hab data' };
export default async function UploadsPage() {
  const session = await getSession(),
    submissions = await getSubmissions(session);
  const canUpload = allowed(session, 'upload', {
    organisation: 'demo-a',
    geography: 'MY-01',
    teras: 2,
    sensitivity: 'demo',
    state: 'draft',
  });
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="HAB DATA / ALIRAN TERKAWAL"
        title="Daripada sumber kepada penerbitan"
        description="Satu jejak yang jelas untuk penyerahan, semakan bebas dan pembetulan versi."
      >
        <DemoBadge />
      </PageHeading>
      <UploadWorkspace
        submissions={submissions}
        canUpload={canUpload}
        role={roleLabels[session.role]}
      />
    </div>
  );
}
