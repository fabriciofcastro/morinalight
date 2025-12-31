import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorDetailClient } from "@/components/admin/sectors/sector-detail-client";

export const metadata: Metadata = {
    title: "Detalhes do Setor | Administração",
    description: "Visualizar detalhes do setor",
};

export default async function SectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <PageBackground>
            <SectorDetailClient sectorId={id} />
        </PageBackground>
    );
}
