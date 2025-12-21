import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorFormClient } from "@/components/admin/sectors/sector-form-client";

export const metadata: Metadata = {
  title: "Editar Setor | Administração",
  description: "Editar informações do setor",
};

export default function SectorEditPage({ params }: { params: { sectorId: string } }) {
  return (
    <PageBackground>
      <SectorFormClient sectorId={params.sectorId} />
    </PageBackground>
  );
}





