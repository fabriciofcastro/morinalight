import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros da Filial | Administração",
  description: "Gerenciar membros da filial",
};

export default function BranchMembersPage({ params }: { params: { branchId: string } }) {
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="branch"
        entityId={params.branchId}
      />
    </PageBackground>
  );
}
