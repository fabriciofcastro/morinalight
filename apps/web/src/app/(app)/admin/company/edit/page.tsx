import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { CompanyEditClient } from "@/components/admin/company/company-edit-client";

export const metadata: Metadata = {
  title: "Configurações da Empresa | Administração",
  description: "Gerencie os dados, configurações fiscais, tema e identidade visual da sua organização.",
};

export default function CompanyEditPage() {
  return (
    <>
      <PageBackground />
      <CompanyEditClient />
    </>
  );
}
