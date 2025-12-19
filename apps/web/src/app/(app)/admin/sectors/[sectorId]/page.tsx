import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorDetailClient } from "@/components/admin/sectors/sector-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Setor | Administração",
  description: "Visualizar detalhes do setor",
};

export default function SectorDetailPage({ params }: { params: { sectorId: string } }) {
  return (
    <PageBackground>
      <SectorDetailClient sectorId={params.sectorId} />
    </PageBackground>
  );
}
