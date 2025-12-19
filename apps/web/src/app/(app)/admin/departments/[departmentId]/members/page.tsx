import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Departamento | Administração",
  description: "Gerenciar membros do departamento",
};

export default function DepartmentMembersPage({
  params,
}: {
  params: { departmentId: string };
}) {
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="department"
        entityId={params.departmentId}
      />
    </PageBackground>
  );
}
