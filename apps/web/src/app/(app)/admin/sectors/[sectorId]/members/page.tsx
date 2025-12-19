import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Setor | Administração",
  description: "Gerenciar membros do setor",
};

export default function SectorMembersPage({ params }: { params: { sectorId: string } }) {
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="sector"
        entityId={params.sectorId}
      />
    </PageBackground>
  );
}
