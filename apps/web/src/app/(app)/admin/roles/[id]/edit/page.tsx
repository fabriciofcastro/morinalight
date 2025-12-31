import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleFormClient } from "@/components/admin/roles/role-form-client";

export const metadata: Metadata = {
  title: "Editar Perfil | Administração",
  description: "Editar informações do perfil de acesso",
};

export default async function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageBackground>
      <RoleFormClient roleId={id} />
    </PageBackground>
  );
}
