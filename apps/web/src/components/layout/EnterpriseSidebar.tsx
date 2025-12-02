"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Settings,
    Bell,
    User,
    Menu,
    Building2,
    Shirt,
    DollarSign,
    Palette,
    Package,
    Users,
    BarChart3,
    Search,
    LogOut,
    HelpCircle,
    X,
    ChevronRight,
    Command,
} from "lucide-react";
import { cn } from "@morina/ui";

// Tipos para estrutura de departamentos
interface Solution {
    id: string;
    name: string;
    path: string;
    icon?: any;
    description?: string;
}

interface Department {
    id: string;
    name: string;
    icon: any;
    color: string;
    solutions: Solution[];
}

// Departamentos exemplo (virão do backend)
const DEPARTMENTS: Department[] = [
    {
        id: "producao",
        name: "Produção",
        icon: Shirt,
        color: "from-blue-500 to-cyan-500",
        solutions: [
            { id: "qualidade", name: "Controle de Qualidade", path: "/producao/qualidade", description: "Monitoramento e padrões de qualidade." },
            { id: "estoque", name: "Gestão de Estoque", path: "/producao/estoque", description: "Controle de entrada e saída de materiais." },
            { id: "planejamento", name: "Planejamento", path: "/producao/planejamento", description: "Cronogramas e alocação de recursos." },
        ],
    },
    {
        id: "comercial",
        name: "Comercial",
        icon: DollarSign,
        color: "from-emerald-500 to-teal-500",
        solutions: [
            { id: "comissoes", name: "Comissões", path: "/commissions", description: "Cálculo e gestão de comissões." },
            { id: "clientes", name: "Clientes", path: "/clients", description: "Base de clientes e CRM." },
            { id: "catalogo", name: "Catálogo", path: "/catalog", description: "Produtos e tabelas de preços." },
        ],
    },
    {
        id: "design",
        name: "Design & Criação",
        icon: Palette,
        color: "from-purple-500 to-pink-500",
        solutions: [
            { id: "colecoes", name: "Coleções", path: "/design/colecoes", description: "Gestão de coleções sazonais." },
            { id: "aprovacao", name: "Aprovação de Modelos", path: "/design/aprovacao", description: "Workflow de aprovação de peças." },
            { id: "tendencias", name: "Tendências", path: "/design/tendencias", description: "Moodboards e pesquisa de mercado." },
        ],
    },
    {
        id: "logistica",
        name: "Logística",
        icon: Package,
        color: "from-orange-500 to-red-500",
        solutions: [
            { id: "expedicao", name: "Expedição", path: "/logistica/expedicao", description: "Controle de envios e transportadoras." },
            { id: "rastreamento", name: "Rastreamento", path: "/logistica/rastreamento", description: "Status de entrega em tempo real." },
            { id: "devolucoes", name: "Devoluções", path: "/logistica/devolucoes", description: "Processamento de logística reversa." },
        ],
    },
    {
        id: "admin",
        name: "Administração",
        icon: Settings,
        color: "from-slate-500 to-zinc-500",
        solutions: [
            { id: "empresa", name: "Dados da Empresa", path: "/admin/company/edit", description: "Dados cadastrais e fiscais." },
            { id: "filiais", name: "Filiais", path: "/admin/branches", description: "Gestão de unidades e filiais." },
            { id: "departamentos", name: "Departamentos", path: "/admin/departments", description: "Estrutura de departamentos." },
            { id: "setores", name: "Setores", path: "/admin/sectors", description: "Divisões e setores funcionais." },
            { id: "cargos", name: "Cargos", path: "/admin/positions", description: "Cargos e funções." },
            { id: "perfis", name: "Perfis de Acesso", path: "/admin/roles", description: "Controle de acesso (RBAC)." },
            { id: "permissoes", name: "Permissões", path: "/admin/permissions", description: "Permissões granulares." },
            { id: "segmentos", name: "Segmentos", path: "/admin/business-segments", description: "Segmentos de negócio ativos." },
            { id: "workflows", name: "Workflows", path: "/admin/workflow-policies", description: "Políticas de aprovação." },
        ],
    },
];

export function EnterpriseSidebar() {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

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

    // Componente para Item do Sidebar (Rail)
    const SidebarItem = ({
        id,
        icon: Icon,
        label,
        active,
        color,
        onClick,
        href,
        badge,
    }: {
        id: string;
        icon: any;
        label: string;
        active?: boolean;
        color?: string;
        onClick?: () => void;
        href?: string;
        badge?: number;
    }) => {
        const isHovered = hoveredItem === id;
        const dept = DEPARTMENTS.find((d) => d.id === id);

        const Content = (
            <div
                className={cn(
                    "relative flex h-12 w-12 items-center justify-center transition-all duration-300 border border-transparent",
                    active
                        ? "bg-white/5 text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10",
                    isHovered && !active && "bg-white/5 text-white scale-105 border-white/20"
                )}
            >
                <Icon className={cn("h-5 w-5", active && "text-[hsl(var(--primary))]")} />

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
            <div
                className="relative flex w-full justify-center py-1"
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                {href ? (
                    <Link href={href} onClick={onClick}>
                        {Content}
                    </Link>
                ) : (
                    <button onClick={onClick} className="w-full flex justify-center">{Content}</button>
                )}

                {/* Sliding Drawer Panel */}
                <AnimatePresence>
                    {isHovered && (dept || id === "profile") && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed left-[80px] top-0 bottom-0 z-30 w-72 border-r border-white/10 bg-[#020617]/95 backdrop-blur-2xl shadow-2xl"
                        >
                            <div className="flex h-full flex-col">
                                {/* Header do Drawer */}
                                <div className="flex h-20 items-center gap-4 border-b border-white/10 px-6 bg-white/5">
                                    <div className={cn("flex h-10 w-10 items-center justify-center bg-gradient-to-br shadow-lg", color || "from-gray-800 to-slate-800")}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-white text-lg tracking-wide">{label}</span>
                                        <span className="text-xs text-white/50 uppercase tracking-widest">Menu</span>
                                    </div>
                                </div>

                                {/* Conteúdo do Drawer */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                    {id === "profile" && (
                                        <div className="space-y-6 p-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20" />
                                                <div>
                                                    <p className="font-bold text-white">Fabrício Castro</p>
                                                    <p className="text-xs text-white/50">Administrador</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                                    <User className="h-4 w-4" /> Meu Perfil
                                                </button>
                                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                                    <Settings className="h-4 w-4" /> Configurações
                                                </button>
                                                <div className="h-px bg-white/10 my-2" />
                                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20">
                                                    <LogOut className="h-4 w-4" /> Sair do Sistema
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {dept?.solutions.map((sol) => (
                                        <Link
                                            key={sol.id}
                                            href={sol.path}
                                            className={cn(
                                                "group flex flex-col gap-1 px-4 py-3 transition-all border border-transparent hover:border-white/10 hover:bg-white/5",
                                                isActive(sol.path)
                                                    ? "bg-white/5 border-l-2 border-l-[hsl(var(--primary))] border-y-transparent border-r-transparent"
                                                    : "text-white/70"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={cn("font-medium transition-colors", isActive(sol.path) ? "text-[hsl(var(--primary))]" : "text-white group-hover:text-white")}>
                                                    {sol.name}
                                                </span>
                                                <ChevronRight className={cn("h-3 w-3 transition-transform opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0", isActive(sol.path) && "opacity-100 translate-x-0 text-[hsl(var(--primary))]")} />
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col items-center bg-[#020617]/80 backdrop-blur-xl py-6 relative z-40">
            {/* Logo */}
            <div className="mb-10">
                <Link href="/dashboard" className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:scale-105 transition-transform duration-300">
                    <Building2 className="h-6 w-6 text-white" />
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex w-full flex-1 flex-col gap-3 overflow-y-auto px-0 scrollbar-none">
                {/* Search Trigger */}
                <SidebarItem
                    id="search"
                    icon={Search}
                    label="Busca (Ctrl+K)"
                    onClick={() => setSearchOpen(true)}
                />

                <div className="my-2 h-px w-10 mx-auto bg-white/10" />

                <SidebarItem
                    id="dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    href="/dashboard"
                    active={isActive("/dashboard")}
                    color="from-blue-500 to-indigo-500"
                />

                <SidebarItem
                    id="analytics"
                    icon={BarChart3}
                    label="Analytics"
                    href="/analytics"
                    active={isActive("/analytics")}
                    color="from-violet-500 to-fuchsia-500"
                />



                <div className="my-2 h-px w-10 mx-auto bg-white/10" />

                {/* Departments */}
                {DEPARTMENTS.map((dept) => (
                    <SidebarItem
                        key={dept.id}
                        id={dept.id}
                        icon={dept.icon}
                        label={dept.name}
                        color={dept.color}
                        active={dept.solutions.some((sol) => isActive(sol.path))}
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
                />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Rail) */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[80px] flex-col border-r border-white/10 bg-transparent">
                <SidebarContent />
            </aside>

            {/* Spacer to push content */}
            <div className="hidden lg:block w-[80px] flex-shrink-0" />

            {/* Search Modal (Command Palette) */}
            <AnimatePresence>
                {searchOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
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
                            className="relative w-full max-w-2xl overflow-hidden bg-[#020617] border border-white/10 shadow-2xl shadow-[hsl(var(--primary)/0.1)]"
                        >
                            <div className="flex items-center border-b border-white/10 px-4 py-3">
                                <Search className="mr-3 h-5 w-5 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="O que você está procurando?"
                                    className="flex-1 bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
                                    autoFocus
                                />
                                <div className="flex items-center gap-1 text-xs text-white/30">
                                    <span className="border border-white/10 px-1.5 py-0.5">ESC</span>
                                    <span>para fechar</span>
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="px-2 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-widest">Sugestões</div>
                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                </button>
                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                                    <BarChart3 className="h-4 w-4" /> Relatórios de Vendas
                                </button>
                                <button className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
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
                            className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden bg-[#020617] border-r border-white/10"
                        >
                            <div className="h-full w-full p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="font-bold text-white text-xl tracking-wide">MENU</span>
                                    <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/10 transition-colors">
                                        <X className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <Link href="/dashboard" className="block text-lg font-medium text-white hover:text-[hsl(var(--primary))] transition-colors">Dashboard</Link>
                                    <Link href="/analytics" className="block text-lg font-medium text-white hover:text-[hsl(var(--primary))] transition-colors">Analytics</Link>

                                    <div className="h-px bg-white/10" />

                                    {DEPARTMENTS.map(d => (
                                        <div key={d.id}>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{d.name}</p>
                                            <div className="pl-4 space-y-3 border-l border-white/10">
                                                {d.solutions.map(s => (
                                                    <Link key={s.id} href={s.path} className="block text-white/70 hover:text-white transition-colors">{s.name}</Link>
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
                onClick={() => setMobileOpen(true)}
                className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center bg-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary)/0.5)] lg:hidden active:scale-95 transition-transform"
            >
                <Menu className="h-6 w-6 text-white" />
            </button>
        </>
    );
}
