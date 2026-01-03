import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros da Filial | Administração",
  description: "Gerenciar membros da filial",
};

export default async function BranchMembersPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;

  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="branch"
        entityId={branchId}
      />
    </PageBackground>
  );
}
