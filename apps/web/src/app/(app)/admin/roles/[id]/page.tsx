import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleDetailClient } from "@/components/admin/roles/role-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Perfil | Administração",
  description: "Visualizar detalhes do perfil de acesso",
};

export default async function RoleDetailPage({ params }: { params: Promise<{ roleId: string  }> }) {
  const { roleId } = await params;

  return (
    <PageBackground>
      <RoleDetailClient roleId={roleId} />
    </PageBackground>
  );
}
