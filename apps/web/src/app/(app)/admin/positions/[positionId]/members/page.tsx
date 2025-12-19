import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Cargo | Administração",
  description: "Gerenciar membros do cargo",
};

export default function PositionMembersPage({
  params,
}: {
  params: { positionId: string };
}) {
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="position"
        entityId={params.positionId}
      />
    </PageBackground>
  );
}
