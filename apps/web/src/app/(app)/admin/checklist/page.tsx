import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { ConsolidatedChecklistClient } from "@/components/admin/checklist/consolidated-checklist-client";

export const metadata: Metadata = {
  title: "Checklist Consolidado - MORINA | Administração",
  description: "Checklist completo consolidado com todas as demandas do sistema MORINA",
};

export default function ConsolidatedChecklistPage() {
  return (
    <PageBackground>
      <ConsolidatedChecklistClient />
    </PageBackground>
  );
}





