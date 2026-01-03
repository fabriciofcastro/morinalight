import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowFormClient } from "@/components/admin/workflow-policies/workflow-form-client";

export const metadata: Metadata = {
  title: "Editar Workflow | Administração",
  description: "Editar política de workflow",
};

export default async function WorkflowEditPage({ params }: { params: Promise<{ policyId: string  }> }) {
  const { policyId } = await params;

  return (
    <PageBackground>
      <WorkflowFormClient policyId={policyId} />
    </PageBackground>
  );
}
