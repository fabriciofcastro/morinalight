import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserAuditClient } from "@/components/admin/users/user-audit-client";

export const metadata: Metadata = {
  title: "Audit Log do Usuário | Administração",
  description: "Histórico de auditoria do usuário",
};

export default async function UserAuditPage({ params }: { params: Promise<{ userId: string  }> }) {
  const { userId } = await params;

  return (
    <PageBackground>
      <UserAuditClient userId={userId} />
    </PageBackground>
  );
}







