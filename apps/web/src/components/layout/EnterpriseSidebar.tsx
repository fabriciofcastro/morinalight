"use client";

import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Search,
  Settings,
  Shirt,
  User,
  Users,
  X,
  Truck,
  ShoppingCart,
  FileText,
  ClipboardList,
  FileCheck,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";

// Tipos para estrutura de departamentos
interface Solution {
  id: string;
  name: string;
  path: string;
  icon?: LucideIcon;
  description?: string;
  permission?: string;
}

interface Department {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  solutions: Solution[];
  permission?: string;
}

// Departamentos exemplo (virão do backend)
const DEPARTMENTS: Department[] = [
  {
    id: "producao",
    name: "Produção",
    icon: Shirt,
    color: "from-blue-500 to-cyan-500",
    solutions: [
      {
        id: "qualidade",
        name: "Controle de Qualidade",
        path: "/producao/qualidade",
        description: "Monitoramento e padrões de qualidade.",
      },
      {
        id: "estoque",
        name: "Gestão de Estoque",
        path: "/producao/estoque",
        description: "Controle de entrada e saída de materiais.",
      },
      {
        id: "planejamento",
        name: "Planejamento",
        path: "/producao/planejamento",
        description: "Cronogramas e alocação de recursos.",
      },
      {
        id: "fichas-custo",
        name: "Fichas de Custo",
        path: "/fichas-custo",
        description: "Gestão de fichas de custo de aviamentos.",
      },
    ],
  },
  {
    id: "comercial",
    name: "Comercial",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-500",
    solutions: [
      {
        id: "comissoes",
        name: "Comissões",
        path: "/commissions",
        description: "Cálculo e gestão de comissões.",
        permission: "commissions:view",
      },
      {
        id: "clientes",
        name: "Clientes",
        path: "/clientes",
        description: "Base de clientes e CRM.",
        permission: "clients:view",
      },
      {
        id: "catalogo",
        name: "Catálogo",
        path: "/catalog",
        description: "Produtos e tabelas de preços.",
        permission: "catalog:view",
      },
    ],
  },
  {
    id: "design",
    name: "Design & Criação",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    solutions: [
      {
        id: "colecoes",
        name: "Coleções",
        path: "/design/colecoes",
        description: "Gestão de coleções sazonais.",
      },
      {
        id: "aprovacao",
        name: "Aprovação de Modelos",
        path: "/design/aprovacao",
        description: "Workflow de aprovação de peças.",
      },
      {
        id: "tendencias",
        name: "Tendências",
        path: "/design/tendencias",
        description: "Moodboards e pesquisa de mercado.",
      },
    ],
  },
  {
    id: "logistica",
    name: "Logística",
    icon: Package,
    color: "from-orange-500 to-red-500",
    solutions: [
      {
        id: "expedicao",
        name: "Expedição",
        path: "/logistica/expedicao",
        description: "Controle de envios e transportadoras.",
      },
      {
        id: "rastreamento",
        name: "Rastreamento",
        path: "/logistica/rastreamento",
        description: "Status de entrega em tempo real.",
      },
      {
        id: "devolucoes",
        name: "Devoluções",
        path: "/logistica/devolucoes",
        description: "Processamento de logística reversa.",
      },
    ],
  },
  {
    id: "admin",
    name: "Administração",
    icon: Settings,
    color: "from-slate-500 to-zinc-500",
    solutions: [
      {
        id: "empresa",
        name: "Dados da Empresa",
        path: "/admin/company/edit",
        description: "Dados cadastrais e fiscais.",
        permission: "settings:company:view",
      },
      {
        id: "filiais",
        name: "Filiais",
        path: "/admin/branches",
        description: "Gestão de unidades e filiais.",
        permission: "branches:view",
      },
      {
        id: "departamentos",
        name: "Departamentos",
        path: "/admin/departments",
        description: "Estrutura de departamentos.",
        permission: "departments:view",
      },
      {
        id: "setores",
        name: "Setores",
        path: "/admin/sectors",
        description: "Divisões e setores funcionais.",
        permission: "sectors:view",
      },
      { id: "cargos", name: "Cargos", path: "/admin/positions", description: "Cargos e funções.", permission: "positions:view" },
      {
        id: "fornecedores",
        name: "Fornecedores",
        path: "/fornecedores/list",
        description: "Gestão de fornecedores e parceiros comerciais.",
        permission: "suppliers:view",
      },
      {
        id: "usuarios",
        name: "Usuários",
        path: "/admin/users/list",
        description: "Gestão de usuários e identidade.",
        permission: "users:view",
      },
      {
        id: "perfis",
        name: "Perfis de Acesso",
        path: "/admin/roles/list",
        description: "Controle de acesso (RBAC).",
        permission: "roles:view",
      },
      {
        id: "permissoes",
        name: "Permissões",
        path: "/admin/permissions/list",
        description: "Permissões granulares.",
        permission: "permissions:view",
      },
      {
        id: "matriz-permissoes",
        name: "Matriz de Permissões",
        path: "/admin/permissions/matrix",
        description: "Visão completa por usuário, com trace e ações por camada.",
        permission: "permissions:view",
      },
      {
        id: "aprovacoes-rbac",
        name: "Aprovações RBAC",
        path: "/admin/permissions/approvals",
        description: "Fila de mudanças sensíveis (grant/deny) com workflow.",
        permission: "permissions:view",
      },
      {
        id: "segmentos",
        name: "Segmentos",
        path: "/admin/business-segments/list",
        description: "Segmentos de negócio ativos.",
        permission: "organization:view",
      },
      {
        id: "workflows",
        name: "Workflows",
        path: "/admin/workflow-policies/list",
        description: "Políticas de aprovação.",
        permission: "workflows:view",
      },
    ],
  },
];

type SidebarItemProps = {
  id: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  color?: string;
  onClick?: () => void;
  href?: string;
  badge?: number;
  dept?: Department;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  isActive: (path: string) => boolean;
  permission?: string;
};

function SidebarItem({
  id,
  icon: Icon,
  label,
  active,
  color,
  onClick,
  href,
  badge,
  dept,
  hoveredItem,
  setHoveredItem,
  isActive,
  permission
}: SidebarItemProps) {
  const ability = useAbility();
  const hasPermission = (() => {
    if (!permission) return true;
    const { action, subject } = parsePermissionKey(permission);
    if (!action || !subject) return false;
    return ability.can(action, subject);
  })();

  const isHovered = hoveredItem === id;

  if (!hasPermission) return null;

  const Content = (
    <div
      className={cn(
        "relative flex h-10 w-10 items-center justify-center transition-all duration-300 border border-transparent",
        active
          ? "bg-white/5 text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
          : "text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10",
        isHovered && !active && "bg-white/5 text-white scale-105 border-white/20",
      )}
    >
      <Icon className={cn("h-4 w-4", active && "text-[hsl(var(--primary))]")} />

      {/* Active Indicator - Full Bar Effect */}
      {active && (
        <motion.div
          layoutId="active-line"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--primary))] shadow-[0_0_15px_hsl(var(--primary))]"
        />
      )}

      {/* Badge */}
      {badge && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50">
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <div className="relative flex w-full justify-center py-0.5">
      {href ? (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                onClick={onClick}
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="cursor-pointer"
              >
                {Content}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="bg-[#0A0D14] border-white/10 text-white font-medium">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClick}
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full flex justify-center cursor-pointer"
              >
                {Content}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="bg-[#0A0D14] border-white/10 text-white font-medium">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Sliding Drawer Panel */}
      <AnimatePresence>
        {isHovered && (dept || id === "profile") && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-[80px] top-0 bottom-0 z-30 w-72 overflow-hidden border-r border-[color-mix(in_oklab,hsl(var(--border))_78%,transparent_22%)] bg-(--surface-veil,#020617) shadow-[0_28px_140px_-45px_rgba(0,0,0,0.98)] ring-1 ring-white/8"
            onMouseEnter={() => setHoveredItem(id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Card HUD (mais sólido, estilo cards) */}
            <div
              className="pointer-events-none absolute inset-0 bg-(--surface-veil,#020617)"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.60) 55%, rgba(0,0,0,0.88) 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 18% 12%, rgba(109,213,255,0.08), transparent 38%), radial-gradient(circle at 78% 72%, rgba(99,102,241,0.06), transparent 52%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 holo-grid" aria-hidden="true" />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-px beam-line"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[radial-gradient(circle_at_center,hsla(var(--primary)/0.45),transparent_70%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 motion-reduce:hidden"
              aria-hidden="true"
            >
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.22)] to-transparent animate-auth-scanline" />
            </div>
            <div className="flex h-full flex-col">
              {/* Header do Drawer */}
              <div className="relative flex h-20 items-center gap-4 border-b border-white/10 px-6 bg-(--surface-veil,#020617)">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(109,213,255,0.08),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05),transparent)]" />
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center bg-linear-to-br shadow-lg",
                    color || "from-gray-800 to-slate-800",
                  )}
                >
                  <div className="absolute inset-0 border border-white/10" />
                  <Icon className="relative h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="block font-bold text-white text-lg tracking-wide">{label}</span>
                  <span className="text-xs text-white/50 uppercase tracking-widest">Menu</span>
                </div>
              </div>

              {/* Conteúdo do Drawer */}
              <div className="relative flex-1 overflow-y-auto p-4">
                {/* Fundo interno (degradê) para separar as opções do fundo */}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(circle at 15% 10%, rgba(109,213,255,0.06), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0.35) 100%)",
                  }}
                />

                <div className="relative space-y-2">
                  {id === "profile" && (
                    <div className="space-y-6 p-2">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-linear-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20" />
                        <div>
                          <p className="font-bold text-white">Fabrício Castro</p>
                          <p className="text-xs text-white/50">Administrador</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          className="group relative flex w-full items-center gap-3 border border-white/12 bg-linear-to-br from-white/7 to-white/2 px-3 py-3 text-sm text-white/85 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-white/18 hover:from-white/9 hover:to-white/3"
                        >
                          <User className="h-4 w-4" /> Meu Perfil
                        </button>
                        <button
                          type="button"
                          className="group relative flex w-full items-center gap-3 border border-white/12 bg-linear-to-br from-white/7 to-white/2 px-3 py-3 text-sm text-white/85 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-white/18 hover:from-white/9 hover:to-white/3"
                        >
                          <Settings className="h-4 w-4" /> Configurações
                        </button>
                        <div className="h-px bg-white/10 my-2" />
                        <button
                          type="button"
                          className="group relative flex w-full items-center gap-3 border border-red-500/25 bg-linear-to-br from-red-500/18 to-red-500/8 px-3 py-3 text-sm text-red-200 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-red-400/35 hover:from-red-500/22 hover:to-red-500/10"
                        >
                          <LogOut className="h-4 w-4" /> Sair do Sistema
                        </button>
                      </div>
                    </div>
                  )}

                  {dept?.solutions
                    .filter((sol) => {
                      if (!sol.permission) return true;
                      const { action, subject } = parsePermissionKey(sol.permission);
                      return action && subject ? ability.can(action, subject) : true;
                    })
                    .map((sol) => (
                      <Link
                        key={sol.id}
                        href={sol.path}
                        className={cn(
                          "group relative flex flex-col gap-1 border border-white/12 bg-linear-to-br from-white/7 to-white/2 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-white/18 hover:from-white/9 hover:to-white/3",
                          isActive(sol.path)
                            ? "border-l-2 border-l-[hsl(var(--primary))] shadow-[0_0_40px_rgba(55,224,246,0.14)]"
                            : "text-white/80",
                        )}
                      >
                        {/* Accent rail */}
                        <span
                          className={cn(
                            "pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-transparent",
                            isActive(sol.path) ? "bg-[hsl(var(--primary))]" : "bg-white/12",
                          )}
                          aria-hidden="true"
                        />
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium transition-colors",
                              isActive(sol.path)
                                ? "text-[hsl(var(--primary))]"
                                : "text-white group-hover:text-white",
                            )}
                          >
                            {sol.name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 transition-transform opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0",
                              isActive(sol.path) &&
                              "opacity-100 translate-x-0 text-[hsl(var(--primary))]",
                            )}
                          />
                        </div>
                        {sol.description && (
                          <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors line-clamp-1">
                            {sol.description}
                          </span>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const ability = useAbility();

  const filteredDepartments = useMemo(() => {
    return DEPARTMENTS.filter((dept) => {
      // Se o departamento tem uma permissão específica, verifica
      if (dept.permission) {
        const { action, subject } = parsePermissionKey(dept.permission);
        if (action && subject && !ability.can(action, subject)) return false;
      }

      // Se todas as soluções internas estão ocultas, oculta o departamento também
      const visibleSolutions = dept.solutions.filter((sol) => {
        if (!sol.permission) return true;
        const { action, subject } = parsePermissionKey(sol.permission);
        return action && subject ? ability.can(action, subject) : true;
      });

      return visibleSolutions.length > 0;
    });
  }, [ability]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Handle Command+K for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Permite abrir a busca via URL (?cmdk=1) — usado pelo 404 contextual ("Buscar no menu")
  useEffect(() => {
    const shouldOpen = searchParams?.get("cmdk") === "1";
    if (shouldOpen) queueMicrotask(() => setSearchOpen(true));
  }, [searchParams]);

  // Foca input quando abrir
  useEffect(() => {
    if (!searchOpen) return;
    try {
      const preset = window.sessionStorage.getItem("morina:cmdkQuery");
      if (preset) {
        queueMicrotask(() => setSearchQuery(preset));
        window.sessionStorage.removeItem("morina:cmdkQuery");
      }
    } catch {
      // ignore
    }
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col items-center bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl py-5 relative z-40 border-r border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] shadow-[0_0_40px_rgba(55,224,246,0.12)]">
      {/* Holo layers */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 holo-grid" />
        <div className="absolute left-0 top-0 h-full w-[2px] beam-line opacity-40" />
      </div>
      {/* Logo */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="flex h-11 w-11 items-center justify-center bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-[0_0_18px_hsl(var(--primary)/0.35)] hover:scale-105 transition-transform duration-300"
        >
          <Building2 className="h-5 w-5 text-white" />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto px-0 scrollbar-none">
        {/* Search Trigger */}
        <SidebarItem
          id="search"
          icon={Search}
          label="Busca (Ctrl+K)"
          onClick={() => setSearchOpen(true)}
          dept={undefined}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isActive={isActive}
        />

        <SidebarItem
          id="home"
          icon={LayoutDashboard}
          label="Executive Dashboard"
          href="/"
          active={pathname === "/"}
          color="from-cyan-500 to-blue-500"
          dept={undefined}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isActive={isActive}
        />

        <div className="my-2 h-px w-10 mx-auto bg-white/10" />

        <SidebarItem
          id="dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
          active={isActive("/dashboard")}
          color="from-blue-500 to-indigo-500"
          dept={undefined}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isActive={isActive}
        />

        <SidebarItem
          id="analytics"
          icon={BarChart3}
          label="Analytics"
          href="/analytics"
          active={isActive("/analytics")}
          color="from-violet-500 to-fuchsia-500"
          dept={undefined}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isActive={isActive}
        />

        <div className="my-2 h-px w-10 mx-auto bg-white/10" />

        {/* Departments */}
        {filteredDepartments.map((dept) => (
          <SidebarItem
            key={dept.id}
            id={dept.id}
            icon={dept.icon}
            label={dept.name}
            color={dept.color}
            active={dept.solutions.some((sol) => isActive(sol.path))}
            dept={dept}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            isActive={isActive}
            permission={dept.permission}
          />
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex w-full flex-col gap-3 px-0 pt-6">
        <div className="my-2 h-px w-10 mx-auto bg-white/10" />
        <SidebarItem
          id="profile"
          icon={User}
          label="Perfil"
          active={isActive("/settings")}
          dept={undefined}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          isActive={isActive}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Rail) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[80px] flex-col border-r border-white/10 bg-transparent">
        {sidebarContent}
      </aside>

      {/* Spacer to push content */}
      <div className="hidden lg:block w-[80px] shrink-0" />

      {/* Search Modal (Command Palette) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl overflow-hidden bg-[color-mix(in_oklab,var(--surface-veil,#020617)_96%,transparent_4%)] border border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] shadow-2xl shadow-[hsl(var(--primary)/0.1)]"
            >
              <div className="flex items-center border-b border-white/10 px-4 py-3">
                <Search className="mr-3 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  className="flex-1 bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1 text-xs text-white/30">
                  <span className="border border-white/10 px-1.5 py-0.5">ESC</span>
                  <span>para fechar</span>
                </div>
              </div>
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-widest">
                  Sugestões
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <BarChart3 className="h-4 w-4" /> Relatórios de Vendas
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Users className="h-4 w-4" /> Gerenciar Usuários
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden bg-(--surface-veil,#020617) border-r border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)]"
            >
              <div className="h-full w-full p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-white text-xl tracking-wide">MENU</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-2 hover:bg-white/10 transition-colors"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                <div className="space-y-6">
                  <Link
                    href="/dashboard"
                    className="block text-lg font-medium text-white hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/analytics"
                    className="block text-lg font-medium text-white hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    Analytics
                  </Link>

                  <div className="h-px bg-white/10" />

                  {DEPARTMENTS.map((d) => (
                    <div key={d.id}>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                        {d.name}
                      </p>
                      <div className="pl-4 space-y-3 border-l border-white/10">
                        {d.solutions.map((s) => (
                          <Link
                            key={s.id}
                            href={s.path}
                            className="block text-white/70 hover:text-white transition-colors"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center bg-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary)/0.5)] lg:hidden active:scale-95 transition-transform"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>
    </>
  );
}
