import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "Usuários — MORINA",
  description: "Gerencie usuários, permissões e acessos do sistema.",
};

export const dynamic = "force-dynamic";

export default function UsersPage() {
  return (
    <SettingsLayout
      title="Usuários"
      description="Gerencie usuários, permissões e acessos do sistema"
      showBackButton
      backHref="/settings"
    >
      <UsersClient />
    </SettingsLayout>
  );
}

