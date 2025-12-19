import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionFormClient } from "@/components/admin/positions/position-form-client";

export const metadata: Metadata = {
  title: "Editar Cargo | Administração",
  description: "Editar informações do cargo",
};

export default function PositionEditPage({ params }: { params: { positionId: string } }) {
  return (
    <PageBackground>
      <PositionFormClient positionId={params.positionId} />
    </PageBackground>
  );
}
