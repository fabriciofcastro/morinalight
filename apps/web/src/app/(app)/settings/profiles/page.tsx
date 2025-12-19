import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfilesClient } from "./profiles-client";

export const metadata: Metadata = {
  title: "Perfis — MORINA",
  description: "Gerencie templates de perfil para usuários.",
};

export const dynamic = "force-dynamic";

export default function ProfilesPage() {
  return (
    <SettingsLayout
      title="Perfis"
      description="Gerencie templates de perfil para usuários"
      showBackButton
      backHref="/settings"
    >
      <ProfilesClient />
    </SettingsLayout>
  );
}




