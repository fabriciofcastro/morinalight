import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Cargo | Administração",
  description: "Gerenciar permissões do cargo",
};

export default async function PositionPermissionsPage({

  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;
  return (
    <PageBackground>
      <PermissionsManagerClientWrapper
        entityType="position"
        entityId={positionId}
      />
    </PageBackground>
  );
}









