import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleDetailClient } from "@/components/admin/roles/role-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Perfil | Administração",
  description: "Visualizar detalhes do perfil de acesso",
};

export default function RoleDetailPage({ params }: { params: { roleId: string } }) {
  return (
    <PageBackground>
      <RoleDetailClient roleId={params.roleId} />
    </PageBackground>
  );
}
