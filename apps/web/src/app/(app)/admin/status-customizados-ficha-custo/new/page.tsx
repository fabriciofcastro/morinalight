import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { StatusCustomizadoFormClient } from "@/components/admin/status-customizados-ficha-custo/status-customizado-form-client";

export const metadata: Metadata = {
  title: "Novo Status Customizado | Administração",
  description: "Criar novo status customizado para fichas de custo",
};

export default function NewStatusCustomizadoPage() {
  return (
    <PageBackground>
      <StatusCustomizadoFormClient />
    </PageBackground>
  );
}


