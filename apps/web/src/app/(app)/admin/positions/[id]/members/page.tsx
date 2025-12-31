import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { MembersManagerClientWrapper } from "@/components/admin/members/members-manager-client-wrapper";

export const metadata: Metadata = {
  title: "Membros do Cargo | Administração",
  description: "Gerenciar membros do cargo",
};

export default async function PositionMembersPage({

  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;
  return (
    <PageBackground>
      <MembersManagerClientWrapper
        entityType="position"
        entityId={positionId}
      />
    </PageBackground>
  );
}
