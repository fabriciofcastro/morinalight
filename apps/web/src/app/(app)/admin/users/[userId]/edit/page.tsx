import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersEditClient } from "@/components/admin/users/users-edit-client";

export const metadata: Metadata = {
  title: "Editar Usuário | Administração",
  description: "Editar informações do usuário",
};

export default function EditUserPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UsersEditClient userId={params.userId} />
    </PageBackground>
  );
}







