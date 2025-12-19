import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Setor | Administração",
  description: "Gerenciar permissões do setor",
};

export default function SectorPermissionsPage({ params }: { params: { sectorId: string } }) {
  return (
    <PageBackground>
      <PermissionsManagerClientWrapper
        entityType="sector"
        entityId={params.sectorId}
      />
    </PageBackground>
  );
}

