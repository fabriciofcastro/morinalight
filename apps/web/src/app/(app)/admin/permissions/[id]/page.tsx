import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { EntityDetailClient } from "@/components/admin/details/entity-detail-client";

export const metadata: Metadata = {
  title: "Detalhes da Permissão | Administração",
  description: "Visualizar detalhes da permissão",
};

export default async function PermissionDetailPage({

  params,
}: {
  params: Promise<{ permissionId: string }>;
}) {
  const { permissionId } = await params;
  return (
    <PageBackground>
      <EntityDetailClient entityType="permission" entityId={permissionId} />
    </PageBackground>
  );
}
