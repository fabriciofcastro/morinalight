import { StatusCustomizadosClient } from "./status-customizados-client";
import { PageBackground } from "@/components/layout/PageBackground";

export const metadata = {
  title: "Status Customizados - Fichas de Custo | MORINA",
  description: "Gerenciar status customizados para fichas de custo",
};

export default function StatusCustomizadosPage() {
  return (
    <>
      <PageBackground />
      <StatusCustomizadosClient />
    </>
  );
}


