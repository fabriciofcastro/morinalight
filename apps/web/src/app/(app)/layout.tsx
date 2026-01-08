"use client";

import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts/KeyboardShortcutsProvider";
import { AppLayout as LayoutShell } from "@/components/layout/app-layout";
import { JarvisHudOverlay } from "@/components/layout/JarvisHudOverlay";
import { RbacApprovalSlaProvider } from "@/components/permissions/rbac-approval-sla-provider";
import { RealtimePermissionsProvider } from "@/components/permissions/realtime-permissions-provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CaslProvider } from "@/components/permissions/casl-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
        <>
          {/* Mantém permissões em sync via eventos/mensageria */}
          <RealtimePermissionsProvider />
          
          {/* SLA sweep best-effort (gera notificações de SLA) */}
          <RbacApprovalSlaProvider />

          <LayoutShell>
            <>
              {/* JARVIS HUD (apenas no pós-login /dashboard) */}
              {showJarvisHud && <JarvisHudOverlay key="jarvis-hud" variant="dashboard" />}
              
              <div key="app-children-wrapper">
                {children}
              </div>
            </>
          </LayoutShell>
        </>
      </CaslProvider>
    </KeyboardShortcutsProvider>
  );
}
