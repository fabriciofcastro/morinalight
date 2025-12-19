import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Perfil | Administração",
  description: "Gerenciar permissões do perfil de acesso",
};

export default function RolePermissionsPage({ params }: { params: { roleId: string } }) {
  return (
    <PageBackground>
      <PermissionsManagerClientWrapper entityType="role" entityId={params.roleId} />
    </PageBackground>
  );
}

