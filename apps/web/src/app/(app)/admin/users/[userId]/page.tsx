import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersDetailClient } from "@/components/admin/users/users-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Usuário | Administração",
  description: "Visualizar detalhes do usuário",
};

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UsersDetailClient userId={params.userId} />
    </PageBackground>
  );
}







