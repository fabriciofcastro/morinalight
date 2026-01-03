import { PageBackground } from "@/components/page-background";
import { FornecedorFormClient } from "./fornecedor-form-client";

export const metadata = {
  title: "Novo Fornecedor",
  description: "Cadastro completo e avançado de fornecedores",
};

export default function NovoFornecedorPage() {
  return (
    <>
      <PageBackground variant="dashboard" />
      <FornecedorFormClient />
    </>
  );
}








