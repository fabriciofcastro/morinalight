import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleFormClient } from "@/components/admin/roles/role-form-client";

export const metadata: Metadata = {
  title: "Editar Perfil | Administração",
  description: "Editar informações do perfil de acesso",
};

export default function RoleEditPage({ params }: { params: { roleId: string } }) {
  return (
    <PageBackground>
      <RoleFormClient roleId={params.roleId} />
    </PageBackground>
  );
}
