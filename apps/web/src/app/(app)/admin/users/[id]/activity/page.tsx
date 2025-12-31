import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserActivityClient } from "@/components/admin/users/user-activity-client";

export const metadata: Metadata = {
  title: "Atividades do Usuário | Administração",
  description: "Histórico de atividades do usuário",
};

export default async function UserActivityPage({ params }: { params: Promise<{ userId: string  }> }) {
  const { userId } = await params;

  return (
    <PageBackground>
      <UserActivityClient userId={userId} />
    </PageBackground>
  );
}







