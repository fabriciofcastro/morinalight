import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";
import { PageBackground } from "@/components/layout/PageBackground";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membros do Departamento | Administração",
  description: "Gerenciar membros do departamento",
};

export default async function DepartmentMembersPage({

  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="department"
        entityId={id}
      />
    </PageBackground>
  );
}
