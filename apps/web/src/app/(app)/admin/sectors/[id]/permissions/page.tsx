import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Setor | Administração",
  description: "Gerenciar permissões do setor",
};

export default async function SectorPermissionsPage({ params }: { params: Promise<{ sectorId: string  }> }) {
  const { sectorId } = await params;

  return (
    <PageBackground>
      <PermissionsManagerClientWrapper
        entityType="sector"
        entityId={sectorId}
      />
    </PageBackground>
  );
}









