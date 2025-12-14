import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { PermissionsClient } from "./permissions-client";

export const metadata: Metadata = {
  title: "Permissões — MORINA",
  description: "Gerencie permissões e níveis de acesso dos usuários.",
};

export const dynamic = "force-dynamic";

export default function PermissionsPage() {
  return (
    <SettingsLayout
      title="Permissões"
      description="Configure permissões granulares e controle de acesso (RBAC)"
      showBackButton
      backHref="/settings"
    >
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <PermissionsClient />
      </div>
    </SettingsLayout>
  );
}
