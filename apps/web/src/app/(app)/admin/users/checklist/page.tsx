import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { UsersChecklistClient } from "@/components/admin/users/users-checklist-client";

export const metadata: Metadata = {
  title: "Checklist de Melhorias - Usuários | Administração",
  description: "Checklist completo de melhorias e pendências do sistema de cadastro de usuários",
};

export default function UsersChecklistPage() {
  return (
    <PageBackground>
      <UsersChecklistClient />
    </PageBackground>
  );
}


