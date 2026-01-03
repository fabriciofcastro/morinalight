import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserSessionsClient } from "@/components/admin/users/user-sessions-client";

export const metadata: Metadata = {
  title: "Sessões do Usuário | Administração",
  description: "Gerenciar sessões ativas do usuário",
};

export default async function UserSessionsPage({ params }: { params: Promise<{ userId: string  }> }) {
  const { userId } = await params;

  return (
    <PageBackground>
      <UserSessionsClient userId={userId} />
    </PageBackground>
  );
}







