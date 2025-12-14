"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  ChevronRight,
  Lock,
  Palette,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SettingsCategory {
  id: string;
  name: string;
  icon: typeof Settings;
  color: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  name: string;
  path: string;
  description?: string;
  badge?: number;
  comingSoon?: boolean;
}

// Categorias adaptadas para MORINA (extensões do e-millennium, não ERP tradicional)
const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "organizacao",
    name: "Organização",
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    items: [
      {
        id: "empresa",
        name: "Dados da Empresa",
        path: "/settings/company",
        description: "Dados cadastrais, fiscais e identidade visual",
      },
      {
        id: "estrutura",
        name: "Estrutura Organizacional",
        path: "/settings/organizational-structure",
        description: "Departamentos, setores, cargos e hierarquia",
      },
      {
        id: "filiais",
        name: "Filiais",
        path: "/settings/branches",
        description: "Gestão de unidades e filiais",
        comingSoon: true,
      },
    ],
  },
  {
    id: "pessoas",
    name: "Pessoas",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    items: [
      {
        id: "usuarios",
        name: "Usuários",
        path: "/settings/users",
        description: "Gestão completa de usuários e funcionários",
        comingSoon: true,
      },
      {
        id: "equipe",
        name: "Equipe",
        path: "/settings/team",
        description: "Membros da organização e papéis",
      },
      {
        id: "convites",
        name: "Convites",
        path: "/settings/invites",
        description: "Convites pendentes e histórico",
        comingSoon: true,
      },
      {
        id: "perfis",
        name: "Perfis",
        path: "/settings/profiles",
        description: "Templates de perfil e acesso",
        comingSoon: true,
      },
    ],
  },
  {
    id: "seguranca",
    name: "Segurança",
    icon: Shield,
    color: "from-red-500 to-orange-500",
    items: [
      {
        id: "permissoes",
        name: "Permissões",
        path: "/settings/permissions",
        description: "RBAC granular e controle de acesso",
      },
      {
        id: "auditoria",
        name: "Auditoria",
        path: "/settings/audit",
        description: "Logs de auditoria e rastreabilidade",
        comingSoon: true,
      },
      {
        id: "aprovacoes",
        name: "Aprovações RBAC",
        path: "/admin/permissions/approvals",
        description: "Fila de mudanças sensíveis com workflow",
      },
    ],
  },
  {
    id: "personalizacao",
    name: "Personalização",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    items: [
      {
        id: "tema",
        name: "Tema & Identidade",
        path: "/settings/company",
        description: "Logo, cores, vídeo e identidade visual",
      },
      {
        id: "preferencias",
        name: "Preferências",
        path: "/settings/preferences",
        description: "Configurações pessoais e do sistema",
        comingSoon: true,
      },
    ],
  },
  {
    id: "notificacoes",
    name: "Notificações",
    icon: Bell,
    color: "from-yellow-500 to-amber-500",
    items: [
      {
        id: "central",
        name: "Central de Notificações",
        path: "/settings/notifications",
        description: "Histórico e gestão de notificações",
        comingSoon: true,
      },
      {
        id: "preferencias-notif",
        name: "Preferências",
        path: "/settings/notifications/preferences",
        description: "Configurar tipos e canais de notificação",
        comingSoon: true,
      },
    ],
  },
  {
    id: "sistema",
    name: "Sistema",
    icon: Zap,
    color: "from-slate-500 to-zinc-500",
    items: [
      {
        id: "integracao-emillennium",
        name: "Integração e-millennium",
        path: "/settings/integrations/emillennium",
        description: "Configuração de sincronização com e-millennium",
        comingSoon: true,
      },
      {
        id: "api-keys",
        name: "API Keys",
        path: "/settings/api-keys",
        description: "Chaves de API e tokens de acesso",
        comingSoon: true,
      },
      {
        id: "logs",
        name: "Logs do Sistema",
        path: "/settings/logs",
        description: "Logs de aplicação e diagnóstico",
        comingSoon: true,
      },
    ],
  },
];

export function SettingsNavigation() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["organizacao"]), // Abre "Organização" por padrão
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav className="relative flex h-full w-64 flex-col border-r border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl overflow-hidden">
      {/* HUD Overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
        <div className="absolute right-0 top-0 h-full w-px beam-line opacity-25" />
      </div>

      {/* Header */}
      <div className="relative border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[linear-gradient(to_bottom_right,hsl(var(--primary)),hsl(var(--secondary)))] shadow-[0_0_18px_hsl(var(--primary)/0.35)]">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Configurações</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">MORINA</p>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
        <div className="space-y-1">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some((item) => isActive(item.path));

            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "group relative flex w-full items-center justify-between px-3 py-2.5 text-left transition-all",
                    hasActiveItem
                      ? "bg-[hsl(var(--primary)/0.12)] border-l-2 border-l-[hsl(var(--primary))]"
                      : "hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] shadow-lg",
                        category.color,
                      )}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        hasActiveItem ? "text-[hsl(var(--primary))]" : "text-white/90 group-hover:text-white",
                      )}
                    >
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-white/40 transition-transform",
                      isExpanded && "rotate-90",
                    )}
                  />
                </button>

                {/* Category Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 space-y-0.5 border-l border-white/10 pl-3">
                        {category.items.map((item) => {
                          const itemIsActive = isActive(item.path);

                          return (
                            <Link
                              key={item.id}
                              href={item.comingSoon ? "#" : item.path}
                              onClick={(e) => {
                                if (item.comingSoon) {
                                  e.preventDefault();
                                }
                              }}
                              className={cn(
                                "group relative flex flex-col gap-1 px-3 py-2 transition-all",
                                itemIsActive
                                  ? "bg-[hsl(var(--primary)/0.15)] border-l-2 border-l-[hsl(var(--primary))] -ml-[2px]"
                                  : "hover:bg-white/5",
                                item.comingSoon && "opacity-50 cursor-not-allowed",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={cn(
                                    "text-xs font-medium transition-colors",
                                    itemIsActive
                                      ? "text-[hsl(var(--primary))]"
                                      : "text-white/70 group-hover:text-white/90",
                                  )}
                                >
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                    {item.badge}
                                  </span>
                                )}
                                {item.comingSoon && (
                                  <span className="text-[10px] text-white/30 uppercase tracking-wider">
                                    Em breve
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <span className="text-[10px] text-white/40 line-clamp-1">
                                  {item.description}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] px-4 py-3">
        <div className="text-[10px] text-white/30 uppercase tracking-widest">
          Extensões MORINA
        </div>
        <div className="mt-1 text-[9px] text-white/20">
          Complemento ao e-millennium
        </div>
      </div>
    </nav>
  );
}

