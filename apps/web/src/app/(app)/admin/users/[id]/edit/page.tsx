import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersEditClient } from "@/components/admin/users/users-edit-client";

export const metadata: Metadata = {
  title: "Editar Usuário | Administração",
  description: "Editar informações do usuário",
};

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <PageBackground variant="dashboard" />
      <UsersEditClient userId={id} />
    </>
  );
}







