import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Departamento | Administração",
  description: "Gerenciar membros do departamento",
};

export default async function DepartmentMembersPage({

  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="department"
        entityId={departmentId}
      />
    </PageBackground>
  );
}
