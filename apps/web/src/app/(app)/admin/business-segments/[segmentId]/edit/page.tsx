import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SegmentFormClient } from "@/components/admin/business-segments/segment-form-client";

export const metadata: Metadata = {
  title: "Editar Segmento | Administração",
  description: "Editar informações do segmento de negócio",
};

export default function SegmentEditPage({ params }: { params: { segmentId: string } }) {
  return (
    <PageBackground>
      <SegmentFormClient segmentId={params.segmentId} />
    </PageBackground>
  );
}
