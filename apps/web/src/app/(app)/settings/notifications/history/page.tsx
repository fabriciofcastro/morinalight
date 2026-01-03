import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { NotificationHistoryClient } from "./notification-history-client";

export const metadata: Metadata = {
  title: "Histórico de Notificações — MORINA",
  description: "Histórico completo de todas as notificações.",
};

export const dynamic = "force-dynamic";

export default function NotificationHistoryPage() {
  return (
    <SettingsLayout
      title="Histórico de Notificações"
      description="Histórico completo de todas as notificações"
      showBackButton
      backHref="/settings"
    >
      <NotificationHistoryClient />
    </SettingsLayout>
  );
}




