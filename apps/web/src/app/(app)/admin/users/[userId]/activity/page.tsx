import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserActivityClient } from "@/components/admin/users/user-activity-client";

export const metadata: Metadata = {
  title: "Atividades do Usuário | Administração",
  description: "Histórico de atividades do usuário",
};

export default function UserActivityPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UserActivityClient userId={params.userId} />
    </PageBackground>
  );
}







