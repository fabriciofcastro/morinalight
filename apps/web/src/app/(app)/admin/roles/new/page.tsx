import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleFormClient } from "@/components/admin/roles/role-form-client";

export const metadata: Metadata = {
  title: "Novo Perfil | Administração",
  description: "Criar um novo perfil de acesso",
};

export default function NewRolePage() {
  return (
    <PageBackground>
      <RoleFormClient />
    </PageBackground>
  );
}
