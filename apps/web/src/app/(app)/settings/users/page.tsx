import type { Metadata } from "next";
import dynamicImport from "next/dynamic";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { LoadingState } from "@/shared/ui/base";

// Lazy load do componente pesado de usuários
const UsersClient = dynamicImport(() => import("./users-client").then((mod) => ({ default: mod.UsersClient })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingState message="Carregando usuários..." />
    </div>
  ),
});

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
