import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionDetailClient } from "@/components/admin/positions/position-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Cargo | Administração",
  description: "Visualizar detalhes do cargo",
};

export default function PositionDetailPage({
  params,
}: {
  params: { positionId: string };
}) {
  return (
    <PageBackground>
      <PositionDetailClient positionId={params.positionId} />
    </PageBackground>
  );
}
