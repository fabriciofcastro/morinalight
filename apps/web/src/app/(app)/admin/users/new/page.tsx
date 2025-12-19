import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersFormClient } from "@/components/admin/users/users-form-client";

export const metadata: Metadata = {
  title: "Novo Usuário | Administração",
  description: "Criar novo usuário no sistema",
};

export default function NewUserPage() {
  return (
    <PageBackground>
      <UsersFormClient />
    </PageBackground>
  );
}







