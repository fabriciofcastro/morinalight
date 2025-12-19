import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersListClient } from "@/components/admin/users/users-list-client";

export const metadata: Metadata = {
  title: "Usuários | Administração",
  description: "Gerenciamento de usuários do sistema",
};

export default function UsersPage() {
  return (
    <PageBackground>
      <UsersListClient />
    </PageBackground>
  );
}







