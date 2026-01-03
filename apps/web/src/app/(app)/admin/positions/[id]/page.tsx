import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionDetailClient } from "@/components/admin/positions/position-detail-client";

export const metadata: Metadata = {
    title: "Detalhes do Cargo | Administração",
    description: "Visualizar detalhes do cargo",
};

export default async function PositionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <PageBackground>
            <PositionDetailClient positionId={id} />
        </PageBackground>
    );
}
