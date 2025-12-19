import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorFormClient } from "@/components/admin/sectors/sector-form-client";

export const metadata: Metadata = {
  title: "Novo Setor | Administração",
  description: "Criar um novo setor",
};

export default function NewSectorPage() {
  return (
    <PageBackground>
      <SectorFormClient />
    </PageBackground>
  );
}
