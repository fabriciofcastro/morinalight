import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersImportClient } from "@/components/admin/users/users-import-client";

export const metadata: Metadata = {
  title: "Importar Usuários | Administração",
  description: "Importar usuários em massa",
};

export default function ImportUsersPage() {
  return (
    <PageBackground>
      <UsersImportClient />
    </PageBackground>
  );
}
