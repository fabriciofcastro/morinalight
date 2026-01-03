import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { FornecedorDetailClient } from "./fornecedor-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Fornecedor | Fornecedores",
  description: "Visualizar detalhes completos do fornecedor",
};

export default async function FornecedorDetailPage({ params }: { params: Promise<{ id: string  }> }) {
  const { id } = await params;

  return (
    <PageBackground>
      <FornecedorDetailClient supplierId={id} />
    </PageBackground>
  );
}





