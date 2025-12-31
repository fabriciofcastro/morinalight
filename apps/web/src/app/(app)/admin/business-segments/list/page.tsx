import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SegmentsListClient } from "@/components/admin/business-segments/segments-list-client";

export const metadata: Metadata = {
  title: "Segmentos | Administração",
  description: "Gerenciamento de segmentos de negócio do sistema",
};

export default function BusinessSegmentsPage() {
  return (
    <PageBackground>
      <SegmentsListClient />
    </PageBackground>
  );
}
