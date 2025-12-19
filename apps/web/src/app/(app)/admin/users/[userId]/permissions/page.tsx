import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserPermissionsClient } from "@/components/admin/users/user-permissions-client";

export const metadata: Metadata = {
  title: "Permissões do Usuário | Administração",
  description: "Gerenciar permissões do usuário",
};

export default function UserPermissionsPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UserPermissionsClient userId={params.userId} />
    </PageBackground>
  );
}







