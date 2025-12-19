import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchesListClient } from "@/components/admin/branches/branches-list-client";

export const metadata: Metadata = {
  title: "Filiais | Administração",
  description: "Gerenciamento de filiais do sistema",
};

export default function BranchesPage() {
  return (
    <PageBackground>
      <BranchesListClient />
    </PageBackground>
  );
}
