"use client";

import { cn } from "@morina/ui";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SettingsNavigation } from "./SettingsNavigation";

interface SettingsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

export function SettingsLayout({
  children,
  title,
  description,
  showBackButton = false,
  backHref,
  actions,
  onSave,
  saving: externalSaving,
}: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [internalSaving, setInternalSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saving = externalSaving ?? internalSaving;

  // Expor função de save para children via context ou callback
  useEffect(() => {
    if (onSave) {
      // Expor função globalmente para componentes filhos
      (window as any).__settingsLayoutSave = async () => {
        setInternalSaving(true);
        try {
          await onSave();
          setLastSaved(new Date());
          notificationCenter.add({
            type: "success",
            title: "Salvo",
            message: "Alterações salvas com sucesso.",
          });
        } catch (error) {
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar",
            message: error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
          });
        } finally {
          setInternalSaving(false);
        }
      };
    }
    return () => {
      delete (window as any).__settingsLayoutSave;
    };
  }, [onSave]);

  // Auto-detect title from pathname if not provided
  const getTitleFromPath = () => {
    if (title) return title;
    const segments = pathname?.split("/").filter(Boolean) || [];
    if (segments.length >= 2 && segments[0] === "settings") {
      const pageName = segments[segments.length - 1];
      return pageName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return "Configurações";
  };

  const getDescriptionFromPath = () => {
    if (description) return description;
    // Default descriptions based on common paths
    const pathDescriptions: Record<string, string> = {
      company: "Gerencie os dados cadastrais, fiscais e identidade visual da empresa",
      "organizational-structure": "Configure a hierarquia organizacional: departamentos, setores e cargos",
      users: "Gerencie usuários, funcionários e seus acessos ao sistema",
      team: "Administre membros da equipe e seus papéis na organização",
      permissions: "Configure permissões granulares e controle de acesso (RBAC)",
    };
    const segments = pathname?.split("/").filter(Boolean) || [];
    const pageName = segments[segments.length - 1];
    return pathDescriptions[pageName] || "Configure as opções do sistema";
  };

  // Keyboard shortcut: Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Navigation Sidebar */}
      <SettingsNavigation />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="relative border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl px-6 py-4">
          {/* HUD Overlays */}
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute inset-0 holo-grid" />
            <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}

              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-white">{getTitleFromPath()}</h1>
                <p className="text-sm text-white/50">{getDescriptionFromPath()}</p>
              </div>
            </div>

            {/* Right: Search + Actions */}
            <div className="flex items-center gap-3">
              {/* Saving Indicator */}
              <AnimatePresence>
                {saving && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                    <span className="hidden sm:inline">Salvando...</span>
                  </motion.div>
                )}
                {!saving && lastSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-sm text-green-400/80"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Salvo às {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-9 items-center gap-2 border border-white/10 bg-white/5 px-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title="Buscar (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Buscar</span>
                <span className="hidden sm:inline text-[10px] text-white/40">Ctrl+K</span>
              </button>

              {/* Custom Actions */}
              {actions}
            </div>
          </div>

          {/* Breadcrumbs (optional, can be enhanced) */}
          <nav className="relative mt-3 flex items-center gap-2 text-xs text-white/40">
            <Link href="/dashboard" className="hover:text-white/70 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/settings" className="hover:text-white/70 transition-colors">
              Configurações
            </Link>
            {pathname && pathname !== "/settings" && (
              <>
                <span>/</span>
                <span className="text-white/60">{getTitleFromPath()}</span>
              </>
            )}
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full w-full p-6">{children}</div>
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl overflow-hidden border border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,var(--surface-veil,#020617)_96%,transparent_4%)] shadow-2xl"
          >
            {/* HUD Overlays */}
            <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
              <div className="absolute inset-0 holo-grid" />
            </div>

            <div className="relative flex items-center border-b border-white/10 px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-white/50" />
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar em configurações..."
                className="flex-1 bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
              />
              <div className="flex items-center gap-1 text-xs text-white/30">
                <span className="border border-white/10 px-1.5 py-0.5">ESC</span>
                <span>fechar</span>
              </div>
            </div>

            <div className="relative max-h-96 overflow-y-auto p-2">
              {searchQuery ? (
                <div className="text-sm text-white/50 px-4 py-8 text-center">
                  Busca em configurações em desenvolvimento...
                </div>
              ) : (
                <div className="px-2 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-widest">
                  Sugestões
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

