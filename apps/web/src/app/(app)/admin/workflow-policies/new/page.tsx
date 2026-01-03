import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowFormClient } from "@/components/admin/workflow-policies/workflow-form-client";

export const metadata: Metadata = {
  title: "Novo Workflow | Administração",
  description: "Criar uma nova política de workflow",
};

export default function NewWorkflowPolicyPage() {
  return (
    <PageBackground>
      <WorkflowFormClient />
    </PageBackground>
  );
}
