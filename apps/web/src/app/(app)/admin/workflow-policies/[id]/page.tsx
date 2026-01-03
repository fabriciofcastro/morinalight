import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowDetailClient } from "@/components/admin/workflow-policies/workflow-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Workflow | Administração",
  description: "Visualizar detalhes da política de workflow",
};

export default async function WorkflowDetailPage({

  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  return (
    <PageBackground>
      <WorkflowDetailClient policyId={policyId} />
    </PageBackground>
  );
}




