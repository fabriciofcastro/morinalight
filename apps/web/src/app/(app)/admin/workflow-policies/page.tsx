import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { WorkflowsListClient } from "@/components/admin/workflow-policies/workflows-list-client";

export const metadata: Metadata = {
  title: "Workflows | Administração",
  description: "Gerenciamento de workflows do sistema",
};

export default function WorkflowPoliciesPage() {
  return (
    <PageBackground>
      <WorkflowsListClient />
    </PageBackground>
  );
}
