import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersExportClient } from "@/components/admin/users/users-export-client";

export const metadata: Metadata = {
  title: "Exportar Usuários | Administração",
  description: "Exportar usuários",
};

export default function ExportUsersPage() {
  return (
    <PageBackground>
      <UsersExportClient />
    </PageBackground>
  );
}
