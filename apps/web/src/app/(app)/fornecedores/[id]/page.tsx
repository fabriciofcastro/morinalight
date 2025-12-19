import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { FornecedorDetailClient } from "./fornecedor-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Fornecedor | Fornecedores",
  description: "Visualizar detalhes completos do fornecedor",
};

export default function FornecedorDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageBackground>
      <FornecedorDetailClient supplierId={params.id} />
    </PageBackground>
  );
}





