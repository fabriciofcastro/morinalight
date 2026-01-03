import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserPermissionsClient } from "@/components/admin/users/user-permissions-client";

export const metadata: Metadata = {
  title: "Permissões do Usuário | Administração",
  description: "Gerenciar permissões do usuário",
};

export default async function UserPermissionsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return (
    <>
      <PageBackground variant="dashboard" />
      <UserPermissionsClient userId={userId} />
    </>
  );
}







