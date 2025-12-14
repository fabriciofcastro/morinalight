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

  type CSSVarProps = React.CSSProperties & Record<`--${string}`, string>;

  type CinematicPreference = "auto" | "on" | "clean" | "off";
  type CinematicPreset = "on" | "clean" | "off";

  const [cinematicPreference, setCinematicPreference] = useState<CinematicPreference>("auto");

  function getRouteDefaultPreset(path: string): CinematicPreset {
    // Páginas de config/admin ficam mais “clean” por legibilidade,
    // mas preservam identidade (noise/vignette mais leve).
    if (path.startsWith("/settings") || path.startsWith("/admin")) {
      return "clean";
    }
    return "on";
  }

  const routePreset = getRouteDefaultPreset(pathname);
  const cinematicPreset: CinematicPreset =
    cinematicPreference === "auto" ? routePreset : cinematicPreference;

  const cinematicVars: CSSVarProps =
    cinematicPreset === "off"
      ? ({
          "--cinematic-noise-opacity": "0",
          "--cinematic-scanlines-opacity": "0",
          "--cinematic-glow-opacity": "0",
          "--cinematic-vignette-opacity": "0",
        } satisfies CSSVarProps)
      : cinematicPreset === "clean"
        ? ({
            // mais clean (menos distração)
            "--cinematic-noise-opacity": "0.03",
            "--cinematic-scanlines-opacity": "0.02",
            "--cinematic-glow-opacity": "0.06",
            "--cinematic-vignette-opacity": "0.55",
          } satisfies CSSVarProps)
        : ({
            // padrão “cinematic”
            "--cinematic-noise-opacity": "0.06",
            "--cinematic-scanlines-opacity": "0.04",
            "--cinematic-glow-opacity": "0.08",
            "--cinematic-vignette-opacity": "0.70",
          } satisfies CSSVarProps);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));

    // Preferência local por usuário (client-only)
    function loadPreference() {
      try {
        const saved = window.localStorage.getItem("cinematic_preset") as CinematicPreference | null;
        if (saved === "auto" || saved === "on" || saved === "clean" || saved === "off") {
          setCinematicPreference(saved);
        } else {
          setCinematicPreference("auto");
        }
      } catch {
        // ignore
      }
    }

    loadPreference();

    function onStorage(e: StorageEvent) {
      if (e.key !== "cinematic_preset") return;
      const next = (e.newValue ?? "auto") as CinematicPreference;
      if (next === "auto" || next === "on" || next === "clean" || next === "off") {
        setCinematicPreference(next);
      }
    }

    function onLocalChange() {
      loadPreference();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("cinematic_preset_changed", onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cinematic_preset_changed", onLocalChange);
    };
  }, []);

  if (isPublicRoute || !mounted) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative flex h-screen overflow-hidden"
      data-cinematic={cinematicPreset}
      data-cinematic-pref={cinematicPreference}
      style={cinematicVars}
    >
      {/* Background animado fixo avançado */}
      <AppBackgroundAdvanced />

      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader />

        {/* Main content */}
        <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 lg:px-10">
          {/* Trilho luminoso superior e contorno */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-[radial-gradient(circle_at_center,color-mix(in_oklab,hsl(var(--primary))_55%,transparent)_0%,transparent_70%)] opacity-60" />
            <div
              className="absolute inset-0 rounded-2xl border"
              style={{ borderColor: "color-mix(in oklab, hsl(var(--border)) 80%, transparent)" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))/0.06,transparent_55%),radial-gradient(circle_at_80%_60%,hsl(var(--accent))/0.06,transparent_55%)] mix-blend-screen opacity-70" />
          </div>

          {/* Conteúdo */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-4 h-px bg-[linear-gradient(90deg,transparent,hsla(var(--accent)/0.35),transparent)] blur-[1px]" />
            {children}
          </div>
        </main>

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
