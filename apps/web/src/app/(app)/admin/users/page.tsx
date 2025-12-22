import { Metadata } from "next";
import { NetworkBackground } from "@/components/animations/network-background";
import { UsersListClient } from "@/components/admin/users/users-list-client";

export const metadata: Metadata = {
  title: "Usuários | Administração",
  description: "Gerenciamento de usuários do sistema",
};

export default function UsersPage() {
  return (
    <>
      <NetworkBackground variant="users" />
      <UsersListClient />
    </>
  );
}







