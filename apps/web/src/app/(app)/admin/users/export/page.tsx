import { Metadata } from "next";
import { NetworkBackground } from "@/components/animations/network-background";
import { UsersExportClient } from "@/components/admin/users/users-export-client";

export const metadata: Metadata = {
  title: "Exportar Usuários | Administração",
  description: "Exportar usuários",
};

export default function ExportUsersPage() {
  return (
    <>
      <NetworkBackground variant="users" />
      <UsersExportClient />
    </>
  );
}
