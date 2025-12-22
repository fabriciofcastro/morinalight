import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsManagerClientWrapper } from "@/components/admin/permissions/permissions-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Permissões do Departamento | Administração",
  description: "Gerenciar permissões do departamento",
};

export default function DepartmentPermissionsPage({
  params,
}: {
  params: { departmentId: string };
}) {
  return (
    <PageBackground>
      <PermissionsManagerClientWrapper
        entityType="department"
        entityId={params.departmentId}
      />
    </PageBackground>
  );
}









