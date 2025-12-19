import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { LoadingState } from "@/components/ui";

// Lazy load do componente pesado de usuários
const UsersClient = dynamic(() => import("./users-client").then((mod) => ({ default: mod.UsersClient })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingState message="Carregando usuários..." />
    </div>
  ),
  ssr: false, // Componente client-side apenas
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
