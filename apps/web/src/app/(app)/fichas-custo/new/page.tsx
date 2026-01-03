import { FichasCustoFormClient } from "./fichas-custo-form-client";
import { PageBackground } from "@/components/layout/PageBackground";

export const metadata = {
  title: "Nova Ficha de Custo | MORINA",
  description: "Criar nova ficha de custo de aviamentos",
};

export default function NovaFichaCustoPage() {
  return (
    <>
      <PageBackground variant="dashboard" />
      <FichasCustoFormClient />
    </>
  );
}









