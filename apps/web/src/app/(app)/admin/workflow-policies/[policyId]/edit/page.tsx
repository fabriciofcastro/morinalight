import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowFormClient } from "@/components/admin/workflow-policies/workflow-form-client";

export const metadata: Metadata = {
  title: "Editar Workflow | Administração",
  description: "Editar política de workflow",
};

export default function WorkflowEditPage({ params }: { params: { policyId: string } }) {
  return (
    <PageBackground>
      <WorkflowFormClient policyId={params.policyId} />
    </PageBackground>
  );
}
