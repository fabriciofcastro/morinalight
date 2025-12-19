import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { EntityDetailClient } from "@/components/admin/details/entity-detail-client";

export const metadata: Metadata = {
  title: "Detalhes da Permissão | Administração",
  description: "Visualizar detalhes da permissão",
};

export default function PermissionDetailPage({
  params,
}: {
  params: { permissionId: string };
}) {
  return (
    <PageBackground>
      <EntityDetailClient entityType="permission" entityId={params.permissionId} />
    </PageBackground>
  );
}
