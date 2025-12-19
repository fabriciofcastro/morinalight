import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SegmentDetailClient } from "@/components/admin/business-segments/segment-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Segmento | Administração",
  description: "Visualizar detalhes do segmento de negócio",
};

export default function SegmentDetailPage({
  params,
}: {
  params: { segmentId: string };
}) {
  return (
    <PageBackground>
      <SegmentDetailClient segmentId={params.segmentId} />
    </PageBackground>
  );
}




