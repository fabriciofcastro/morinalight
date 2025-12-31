import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { FornecedorEditClient } from "./fornecedor-edit-client";

export const metadata: Metadata = {
  title: "Editar Fornecedor | Fornecedores",
  description: "Editar informações do fornecedor",
};

export default async function FornecedorEditPage({ params }: { params: Promise<{ id: string  }> }) {
  const { id } = await params;

  return (
    <PageBackground>
      <FornecedorEditClient supplierId={id} />
    </PageBackground>
  );
}





