import { Metadata } from "next";
import { NetworkBackground } from "@/components/animations/network-background";
import { UsersDetailClient } from "@/components/admin/users/users-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Usuário | Administração",
  description: "Visualizar detalhes do usuário",
};

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string  }> }) {
  const { userId } = await params;

  return (
    <>
      <NetworkBackground variant="users" />
      <UsersDetailClient userId={userId} />
    </>
  );
}







