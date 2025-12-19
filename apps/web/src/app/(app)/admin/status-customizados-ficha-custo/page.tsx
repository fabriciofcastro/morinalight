import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { StatusCustomizadosListClient } from "@/components/admin/status-customizados-ficha-custo/status-customizados-list-client";

export const metadata: Metadata = {
  title: "Status Customizados | Administração",
  description: "Gerenciamento de status customizados para fichas de custo",
};

export default function StatusCustomizadosPage() {
  return (
    <PageBackground>
      <StatusCustomizadosListClient />
    </PageBackground>
  );
}


