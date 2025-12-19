import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { StatusCustomizadoFormClient } from "@/components/admin/status-customizados-ficha-custo/status-customizado-form-client";

export const metadata: Metadata = {
  title: "Editar Status Customizado | Administração",
  description: "Editar status customizado para fichas de custo",
};

export default function EditStatusCustomizadoPage({ params }: { params: { id: string } }) {
  return (
    <PageBackground>
      <StatusCustomizadoFormClient statusId={params.id} />
    </PageBackground>
  );
}


