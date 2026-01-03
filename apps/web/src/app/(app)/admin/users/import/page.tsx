import { Metadata } from "next";
import { NetworkBackground } from "@/components/animations/network-background";
import { UsersImportClient } from "@/components/admin/users/users-import-client";

export const metadata: Metadata = {
  title: "Importar Usuários | Administração",
  description: "Importar usuários em massa",
};

export default function ImportUsersPage() {
  return (
    <>
      <NetworkBackground variant="users" />
      <UsersImportClient />
    </>
  );
}
