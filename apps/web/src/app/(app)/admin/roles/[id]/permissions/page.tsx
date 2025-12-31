import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Perfil | Administração",
  description: "Gerenciar permissões do perfil de acesso",
};

export default async function RolePermissionsPage({ params }: { params: Promise<{ roleId: string  }> }) {
  const { roleId } = await params;

  return (
    <PageBackground>
      <PermissionsManagerClientWrapper entityType="role" entityId={roleId} />
    </PageBackground>
  );
}









