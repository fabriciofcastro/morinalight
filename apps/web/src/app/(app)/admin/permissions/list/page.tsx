import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsListClient } from "@/components/admin/permissions/permissions-list-client";

export const metadata: Metadata = {
  title: "Permissões | Administração",
  description: "Gerenciamento de permissões do sistema",
};

export default function PermissionsPage() {
  return (
    <PageBackground>
      <PermissionsListClient />
    </PageBackground>
  );
}
