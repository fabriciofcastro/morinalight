import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { FornecedorEditClient } from "./fornecedor-edit-client";

export const metadata: Metadata = {
  title: "Editar Fornecedor | Fornecedores",
  description: "Editar informações do fornecedor",
};

export default function FornecedorEditPage({ params }: { params: { id: string } }) {
  return (
    <PageBackground>
      <FornecedorEditClient supplierId={params.id} />
    </PageBackground>
  );
}





