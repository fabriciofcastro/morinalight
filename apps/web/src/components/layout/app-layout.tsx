"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectionStatusIndicator } from "../connection-status-indicator";
import { RealtimeNotificationsProvider } from "../notifications/realtime-notifications-provider";
import { OfflineSyncNotification } from "../offline-sync-notification";
import { AppBackgroundAdvanced } from "./app-background-advanced";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Páginas que não devem ter o layout completo
  const publicRoutes = ["/login", "/invite"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isPublicRoute || !mounted) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Background animado fixo avançado */}
      <AppBackgroundAdvanced />

      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader />

        {/* Main content */}
        <main className="relative z-10 flex-1 overflow-y-auto">{children}</main>

        {/* Footer */}
        <AppFooter />
      </div>

      {/* Status de conexão */}
      <ConnectionStatusIndicator position="fixed" className="bottom-4 right-4" />

      {/* Notificação de sincronização offline */}
      <OfflineSyncNotification />

      {/* Provider de notificações em tempo real */}
      <RealtimeNotificationsProvider />
    </div>
  );
}
