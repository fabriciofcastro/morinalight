import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UserAuditClient } from "@/components/admin/users/user-audit-client";

export const metadata: Metadata = {
  title: "Audit Log do Usuário | Administração",
  description: "Histórico de auditoria do usuário",
};

export default function UserAuditPage({ params }: { params: { userId: string } }) {
  return (
    <PageBackground>
      <UserAuditClient userId={params.userId} />
    </PageBackground>
  );
}







