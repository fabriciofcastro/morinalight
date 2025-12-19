import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowDetailClient } from "@/components/admin/workflow-policies/workflow-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Workflow | Administração",
  description: "Visualizar detalhes da política de workflow",
};

export default function WorkflowDetailPage({
  params,
}: {
  params: { policyId: string };
}) {
  return (
    <PageBackground>
      <WorkflowDetailClient policyId={params.policyId} />
    </PageBackground>
  );
}




