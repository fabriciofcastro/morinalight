import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorsListClient } from "@/components/admin/sectors/sectors-list-client";

export const metadata: Metadata = {
  title: "Setores | Administração",
  description: "Gerenciamento de setores do sistema",
};

export default function SectorsPage() {
  return (
    <PageBackground>
      <SectorsListClient />
    </PageBackground>
  );
}
