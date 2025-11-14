"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Monitor, Moon, Search, Settings, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { clearAuthToken, getAuthUser } from "@/lib/auth-client";
import { NotificationCenter } from "../notifications/notification-center";

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const user = getAuthUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  const getThemeIcon = () => {
    if (!mounted) return Monitor;
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  const cycleTheme = () => {
    if (!mounted) return;
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("system");
        break;
      default:
        setTheme("light");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] backdrop-blur-xl px-4 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]"
          >
            <Menu className="h-5 w-5 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
          </button>
        )}
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
          <input
            type="search"
            placeholder="Buscar..."
            className="h-9 w-64 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--bg)_98%,transparent)] pl-9 pr-3 text-sm transition-colors placeholder:text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
            "hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
            "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
          )}
          title={`Tema: ${mounted ? theme : "sistema"}`}
        >
          <ThemeIcon className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-all",
              "hover:ring-2 hover:ring-[var(--primary)] hover:ring-offset-2 hover:ring-offset-[var(--surface)]",
              "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white",
            )}
          >
            <User className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] p-1 shadow-lg backdrop-blur-xl"
              >
                <div className="px-3 py-2 border-b border-[color-mix(in_oklab,var(--border)_90%,transparent)]">
                  <p className="text-sm font-medium text-[var(--fg)]">{user?.email}</p>
                  <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {user?.displayName || "Usuário"}
                  </p>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] transition-colors hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] hover:text-[var(--fg)]">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] transition-colors hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] hover:text-[var(--fg)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
