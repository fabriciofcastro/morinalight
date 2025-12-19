import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { NotificationPreferencesClient } from "./notification-preferences-client";

export const metadata: Metadata = {
  title: "Preferências de Notificações — MORINA",
  description: "Configure suas preferências de notificações.",
};

export const dynamic = "force-dynamic";

export default function NotificationPreferencesPage() {
  return (
    <SettingsLayout
      title="Preferências de Notificações"
      description="Configure suas preferências de notificações"
      showBackButton
      backHref="/settings"
    >
      <NotificationPreferencesClient />
    </SettingsLayout>
  );
}




