import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SegmentDetailClient } from "@/components/admin/business-segments/segment-detail-client";

export const metadata: Metadata = {
    title: "Detalhes do Segmento | Administração",
    description: "Visualizar detalhes do segmento de negócio",
};

export default async function SegmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <PageBackground>
            <SegmentDetailClient segmentId={id} />
        </PageBackground>
    );
}
