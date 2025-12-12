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
import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/notification-center";

export function EnterpriseHeader() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,hsl(var(--surface))_72%,transparent_28%)] backdrop-blur-2xl px-6 overflow-hidden">
      {/* Holo overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[3px] beam-line opacity-60" />
        <div className="absolute right-[12%] top-0 h-full w-[2px] beam-line opacity-30" />
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center gap-4 max-w-xl">
        <div className="group relative w-full">
          <div className="absolute inset-0 bg-[hsl(var(--primary)/0.08)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative flex h-12 items-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)]">
            <div className="h-full w-12 flex items-center justify-center border-r border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-white/5">
              <Search className="h-4 w-4 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Buscar em todo o sistema..."
              className={cn(
                "h-full flex-1 border-0 bg-transparent px-4",
                "text-white placeholder:text-white/20",
                "hover:border-0 focus:border-0 focus:shadow-none",
              )}
            />
            {/* Corner accents */}
            <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
            <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Help */}
        <button
          type="button"
          onClick={() => window.open("/help", "_blank")}
          className="flex h-12 w-12 items-center justify-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] text-white/70 hover:text-white hover:border-[hsl(var(--primary)/0.55)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] transition-all"
          title="Central de Ajuda"
          aria-label="Abrir central de ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications (realtime) */}
        <div className="flex h-12 items-center justify-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] px-1">
          <NotificationCenter maxNotifications={8} />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex h-12 items-center gap-3 border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] px-3 hover:border-[hsl(var(--primary)/0.55)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">Fabrício Castro</p>
              <p className="text-[10px] text-white/50">Administrador</p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-14 w-56 border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)] bg-[color-mix(in_oklab,hsl(var(--surface))_78%,black_22%)] p-2 shadow-[0_28px_120px_-48px_rgba(55,224,246,0.35)]"
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 border border-transparent px-3 py-2 text-sm text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white transition-all"
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 border border-transparent px-3 py-2 text-sm text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white transition-all"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Configurações
                </Link>
                <div className="my-2 h-px bg-white/10" />
                <button
                  type="button"
                  className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
