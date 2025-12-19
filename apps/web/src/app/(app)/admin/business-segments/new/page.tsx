import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SegmentFormClient } from "@/components/admin/business-segments/segment-form-client";

export const metadata: Metadata = {
  title: "Novo Segmento | Administração",
  description: "Criar um novo segmento de negócio",
};

export default function NewBusinessSegmentPage() {
  return (
    <PageBackground>
      <SegmentFormClient />
    </PageBackground>
  );
}
