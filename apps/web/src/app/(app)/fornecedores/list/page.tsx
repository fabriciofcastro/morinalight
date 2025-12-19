import { PageBackground } from "@/components/page-background";
import { FornecedoresListClient } from "./fornecedores-list-client";

export const metadata = {
  title: "Lista de Fornecedores",
  description: "Visualização completa de todos os fornecedores cadastrados",
};

export default function FornecedoresListPage() {
  return (
    <>
      <PageBackground />
      <FornecedoresListClient />
    </>
  );
}








