"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { EnterpriseHeader } from "@/components/layout/EnterpriseHeader";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { JarvisHudOverlay } from "@/components/layout/JarvisHudOverlay";
import { PageBackground } from "@/components/layout/PageBackground";
import { RealtimeNotificationsProvider } from "@/components/notifications/realtime-notifications-provider";
import { RbacApprovalSlaProvider } from "@/components/permissions/rbac-approval-sla-provider";
import { RealtimePermissionsProvider } from "@/components/permissions/realtime-permissions-provider";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts/KeyboardShortcutsProvider";

import { CaslProvider } from "@/components/permissions/casl-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = pathname === "/" || pathname?.startsWith("/admin/company/edit") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin/users") || pathname?.startsWith("/admin/invoices") || pathname?.startsWith("/analytics");
  const showJarvisHud = pathname?.startsWith("/dashboard");

  // Guarda a última rota “válida” (para 404 contextual sugerir retorno)
  useEffect(() => {
    try {
      if (!pathname) return;
      // evita persistir rotas públicas/ruins
      if (pathname.startsWith("/login") || pathname.startsWith("/select-organization")) return;
      window.sessionStorage.setItem("morina:lastPath", pathname);
    } catch {
      // ignore
    }
  }, [pathname]);

  return (
    <KeyboardShortcutsProvider>
      <CaslProvider>
        <div className="flex h-screen overflow-hidden relative">
          {/* Dynamic Background */}
          <PageBackground />

          {/* JARVIS HUD (apenas no pós-login /dashboard) */}
          {showJarvisHud ? <JarvisHudOverlay variant="dashboard" /> : null}

          {/* Sidebar */}
          <EnterpriseSidebar />

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden relative z-10">
            {/* Header */}
            <EnterpriseHeader />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <div className={isFullWidth ? "w-full px-6 py-6" : "container mx-auto p-6"}>{children}</div>
            </main>

            {/* Footer */}
            <footer className="relative border-t border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,hsl(var(--surface))_72%,transparent_28%)] backdrop-blur-xl px-6 py-4 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-0 holo-grid" />
                <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
                <div className="absolute right-[10%] top-0 h-full w-px beam-line opacity-25" />
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span>&copy; 2025 Morina Têxtil</span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>v2.0.0</span>
                </div>
                <div className="flex items-center justify-center gap-4 flex-1">
                  <Link href="/termos" className="hover:text-white/70 transition-colors">
                    Termos
                  </Link>
                  <Link href="/privacidade" className="hover:text-white/70 transition-colors">
                    Privacidade
                  </Link>
                  <Link href="/lgpd" className="hover:text-white/70 transition-colors">
                    LGPD
                  </Link>
                </div>
                <div className="w-[120px]" /> {/* Spacer para manter alinhamento */}
              </div>
            </footer>
          </div>

          {/* Mantém permissões em sync via eventos/mensageria */}
          <RealtimePermissionsProvider />

          {/* Notificações in-app via eventos/mensageria */}
          <RealtimeNotificationsProvider />

          {/* SLA sweep best-effort (gera notificações de SLA) */}
          <RbacApprovalSlaProvider />
        </div>
      </CaslProvider>
    </KeyboardShortcutsProvider>
  );
}
