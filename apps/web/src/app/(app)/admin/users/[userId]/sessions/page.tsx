import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserSessionsClient } from "@/components/admin/users/user-sessions-client";

export const metadata: Metadata = {
  title: "Sessões do Usuário | Administração",
  description: "Gerenciar sessões ativas do usuário",
};

export default function UserSessionsPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UserSessionsClient userId={params.userId} />
    </PageBackground>
  );
}







