import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";
import { PageBackground } from "@/components/layout/PageBackground";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissões do Departamento | Administração",
  description: "Gerenciar permissões do departamento",
};

export default async function DepartmentPermissionsPage({

  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageBackground>
      <PermissionsManagerClientWrapper
        entityType="department"
        entityId={id}
      />
    </PageBackground>
  );
}









