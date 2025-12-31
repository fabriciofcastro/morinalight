import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Setor | Administração",
  description: "Gerenciar membros do setor",
};

export default async function SectorMembersPage({ params }: { params: Promise<{ sectorId: string  }> }) {
  const { sectorId } = await params;

  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="sector"
        entityId={sectorId}
      />
    </PageBackground>
  );
}
