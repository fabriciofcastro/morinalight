import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchDetailClient } from "@/components/admin/branches/branch-detail-client";

export const metadata: Metadata = {
  title: "Detalhes da Filial | Administração",
  description: "Visualizar detalhes da filial",
};

export default function BranchDetailPage({ params }: { params: { branchId: string } }) {
  return (
    <PageBackground>
      <BranchDetailClient branchId={params.branchId} />
    </PageBackground>
  );
}
