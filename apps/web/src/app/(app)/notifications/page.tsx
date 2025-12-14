import type { Metadata } from "next";

import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notificações — MORINA",
  description: "Central de notificações e alertas do sistema.",
};

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return <NotificationsClient />;
}


