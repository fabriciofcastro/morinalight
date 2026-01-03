"use client";

import { cn, Input } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { InactivityWarning } from "@/components/auth/InactivityWarning";
import { useLogout } from "@/hooks/use-logout";
import { Can } from "@/lib/auth";

export function EnterpriseHeader() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const {
    logoutDialogOpen,
    setLogoutDialogOpen,
    hasUnsavedChanges,
    inactivityWarning,
    timeRemaining,
    handleLogout,
    openLogoutDialog,
    extendSession,
  } = useLogout();

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,hsl(var(--surface))_72%,transparent_28%)] backdrop-blur-2xl px-6">
      {/* Holo overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[3px] beam-line opacity-60" />
        <div className="absolute right-[12%] top-0 h-full w-[2px] beam-line opacity-30" />
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center gap-4 max-w-xl">
        <div className="group relative w-full">
          {/* Hover effect background */}
          <div className="absolute -inset-px bg-linear-to-r from-[hsl(var(--primary)/0)] to-[hsl(var(--primary)/0)] rounded-lg group-hover:from-[hsl(var(--primary)/0.3)] group-hover:to-[hsl(var(--primary)/0.2)] blur-sm transition-all duration-300 group-focus-within:hidden pointer-events-none" />
          {/* Focus glow */}
          <div className="absolute inset-0 bg-[hsl(var(--primary)/0.08)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
          <div className="relative flex h-12 items-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] group-hover:border-[hsl(var(--primary)/0.5)] group-focus-within:border-[hsl(var(--primary))] transition-all duration-300 rounded-lg cursor-text">
            <div className="h-full w-12 flex items-center justify-center border-r border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-white/5 group-hover:border-[hsl(var(--primary)/0.3)] group-focus-within:border-[hsl(var(--primary)/0.5)] transition-colors">
              <Search className="h-4 w-4 text-white/40 group-hover:text-[hsl(var(--primary)/0.8)] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Buscar em todo o sistema..."
              aria-label="Buscar em todo o sistema"
              className={cn(
                "h-full flex-1 border-0 bg-transparent px-4 cursor-text",
                "text-white placeholder:text-white/20",
                "hover:border-0 focus:border-0 focus:shadow-none focus:outline-none",
                "transition-colors",
              )}
            />
            {/* Corner accents */}
            <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary)/0.6)] group-focus-within:border-[hsl(var(--primary))] transition-colors" />
            <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary)/0.6)] group-focus-within:border-[hsl(var(--primary))] transition-colors" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Help */}
        <div className="group relative">
          <button
            type="button"
            onClick={() => router.push("/support")}
            className="relative flex h-12 w-12 items-center justify-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] text-white/70 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary)/0.55)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_45%,black_55%)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
            title="Central de Ajuda (Suporte)"
            aria-label="Abrir central de ajuda e suporte"
          >
            <HelpCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
            {/* Corner accents */}
            <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
            <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
          </button>
        </div>

        {/* Notifications (realtime) */}
        <Can I="read" a="Notification">
          <div className="group relative flex h-12 items-center justify-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] px-1 hover:border-[hsl(var(--primary)/0.5)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_45%,black_55%)] transition-all rounded-lg cursor-pointer">
            <NotificationCenter maxNotifications={8} />
            {/* Corner accents */}
            <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
            <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
          </div>
        </Can>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <div className="group relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label={userMenuOpen ? "Fechar menu do usuário" : "Abrir menu do usuário"}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              className="relative flex h-12 items-center gap-3 border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] px-3 hover:border-[hsl(var(--primary)/0.55)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_45%,black_55%)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[hsl(var(--primary)/0.9)] via-[hsl(var(--primary)/0.7)] to-[hsl(var(--accent)/0.8)] shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">Fabrício Castro</p>
                <p className="text-[10px] text-white/60">Administrador</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              {/* Corner accents */}
              <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
              <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary))] transition-colors" />
            </button>
          </div>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 top-14 z-[60] w-56 border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)] bg-[color-mix(in_oklab,hsl(var(--surface))_78%,black_22%)] p-2 shadow-[0_28px_120px_-48px_rgba(55,224,246,0.35)] rounded-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm text-white/80 hover:border-white/15 hover:bg-white/8 hover:text-white transition-all rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1 focus:ring-offset-transparent"
                  aria-label="Ir para meu perfil"
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </button>
                <Can I="read" a="Settings">
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 border border-transparent px-3 py-2 text-sm text-white/80 hover:border-white/15 hover:bg-white/8 hover:text-white transition-all rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1 focus:ring-offset-transparent"
                    aria-label="Ir para configurações"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Configurações
                  </Link>
                </Can>
                <div className="my-2 h-px bg-white/10" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    openLogoutDialog();
                  }}
                  className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm text-red-400/90 hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-300 transition-all rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-1 focus:ring-offset-transparent"
                  title="Sair do sistema (Ctrl+Shift+Q)"
                  aria-label="Sair do sistema"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onLogout={handleLogout}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Inactivity Warning */}
      <InactivityWarning
        open={inactivityWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={() => handleLogout(false)}
      />
    </header>
  );
}
