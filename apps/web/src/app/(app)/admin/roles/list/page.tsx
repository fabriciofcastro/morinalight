import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RolesListClient } from "@/components/admin/roles/roles-list-client";

export const metadata: Metadata = {
  title: "Perfis de Acesso | Administração",
  description: "Gerenciamento de perfis de acesso do sistema",
};

export default function RolesPage() {
  return (
    <PageBackground>
      <RolesListClient />
    </PageBackground>
  );
}
