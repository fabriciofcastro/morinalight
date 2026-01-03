import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionsListClient } from "@/components/admin/positions/positions-list-client";

export const metadata: Metadata = {
  title: "Cargos | Administração",
  description: "Gerenciamento de cargos do sistema",
};

export default function PositionsPage() {
  return (
    <PageBackground>
      <PositionsListClient />
    </PageBackground>
  );
}
