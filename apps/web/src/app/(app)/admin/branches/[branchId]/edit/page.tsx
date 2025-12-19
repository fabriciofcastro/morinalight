import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchFormClient } from "@/components/admin/branches/branch-form-client";

export const metadata: Metadata = {
  title: "Editar Filial | Administração",
  description: "Editar informações da filial",
};

export default function BranchEditPage({ params }: { params: { branchId: string } }) {
  return (
    <PageBackground>
      <BranchFormClient branchId={params.branchId} />
    </PageBackground>
  );
}

