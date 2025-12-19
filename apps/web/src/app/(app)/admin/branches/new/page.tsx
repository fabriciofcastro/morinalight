import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchFormClient } from "@/components/admin/branches/branch-form-client";

export const metadata: Metadata = {
  title: "Nova Filial | Administração",
  description: "Criar uma nova filial",
};

export default function NewBranchPage() {
  return (
    <PageBackground>
      <BranchFormClient />
    </PageBackground>
  );
}
