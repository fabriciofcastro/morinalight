import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionEditClient } from "@/components/admin/permissions/permission-edit-client";

export const metadata: Metadata = {
  title: "Editar Permissão | Administração",
  description: "Editar informações da permissão",
};

export default function PermissionEditPage() {
  return (
    <PageBackground>
      <PermissionEditClient />
    </PageBackground>
  );
}





