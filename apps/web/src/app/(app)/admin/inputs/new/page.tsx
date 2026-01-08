import { PageBackground } from "@/components/page-background";
import { InsumoFormClient } from "./insumo-form-client";

export const metadata = {
  title: "Novo Insumo",
  description: "Cadastro completo de insumos e aviamentos",
};

export default function NewInsumoPage() {
  return (
    <>
      <PageBackground variant="none" />
      <InsumoFormClient />
    </>
  );
}

