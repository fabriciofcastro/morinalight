"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@morina/ui";

// Tipos para estrutura de departamentos
interface Solution {
    id: string;
    name: string;
    path: string;
    icon?: any;
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
            { id: "qualidade", name: "Controle de Qualidade", path: "/producao/qualidade" },
            { id: "estoque", name: "Gestão de Estoque", path: "/producao/estoque" },
            { id: "planejamento", name: "Planejamento", path: "/producao/planejamento" },
        ],
    },
    {
        id: "comercial",
        name: "Comercial",
        icon: DollarSign,
        color: "from-emerald-500 to-teal-500",
        solutions: [
            { id: "comissoes", name: "Comissões", path: "/commissions" },
            { id: "clientes", name: "Clientes", path: "/clients" },
            { id: "catalogo", name: "Catálogo", path: "/catalog" },
        ],
    },
    {
        id: "design",
        name: "Design & Criação",
        icon: Palette,
        color: "from-purple-500 to-pink-500",
        solutions: [
            { id: "colecoes", name: "Coleções", path: "/design/colecoes" },
            { id: "aprovacao", name: "Aprovação de Modelos", path: "/design/aprovacao" },
            { id: "tendencias", name: "Tendências", path: "/design/tendencias" },
        ],
    },
    {
        id: "logistica",
        name: "Logística",
        icon: Package,
        color: "from-orange-500 to-red-500",
        solutions: [
            { id: "expedicao", name: "Expedição", path: "/logistica/expedicao" },
            { id: "rastreamento", name: "Rastreamento", path: "/logistica/rastreamento" },
            { id: "devolucoes", name: "Devoluções", path: "/logistica/devolucoes" },
        ],
    },
];

export function EnterpriseSidebar() {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

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

        const Content = (
            <div
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                    active
                        ? "bg-white/10 text-white shadow-lg shadow-white/5"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    isHovered && !active && "bg-white/5 text-white scale-110"
                )}
            >
                <Icon className={cn("h-5 w-5", active && "text-[hsl(var(--primary))]")} />

                {/* Active Indicator Dot */}
                {active && (
                    <motion.div
                        layoutId="active-dot"
                        className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))]"
                    />
                )}

                {/* Badge */}
                {badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {badge}
                    </span>
                )}
            </div>
        );

        return (
            <div
                className="relative flex w-full justify-center py-2"
                onMouseEnter={() => setHoveredItem(id)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                {href ? (
                    <Link href={href} onClick={onClick}>
                        {Content}
                    </Link>
                ) : (
                    <button onClick={onClick}>{Content}</button>
                )}

                {/* Floating Menu / Tooltip */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.95 }}
                            animate={{ opacity: 1, x: 20, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed left-[80px] z-50 min-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-[#0F172A]/95 p-4 shadow-2xl backdrop-blur-xl"
                            style={{ top: "auto" }} // Positioning logic handled by layout flow usually, but fixed here for simplicity
                        >
                            {/* Header do Menu Flutuante */}
                            <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", color || "from-gray-500 to-slate-500")}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-white">{label}</span>
                            </div>

                            {/* Conteúdo do Menu (Links ou Descrição) */}
                            <div className="space-y-1">
                                {id === "dashboard" && (
                                    <p className="text-xs text-white/50">Visão geral e métricas principais.</p>
                                )}
                                {id === "analytics" && (
                                    <p className="text-xs text-white/50">Relatórios detalhados e insights.</p>
                                )}
                                {id === "search" && (
                                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/50">
                                        <Search className="h-4 w-4" />
                                        <span>Buscar... (Ctrl+K)</span>
                                    </div>
                                )}
                                {id === "profile" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500" />
                                            <div>
                                                <p className="text-sm font-medium text-white">Fabrício Castro</p>
                                                <p className="text-xs text-white/50">Admin</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                                            <User className="h-4 w-4" /> Perfil
                                        </button>
                                        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                                            <Settings className="h-4 w-4" /> Configurações
                                        </button>
                                        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                            <LogOut className="h-4 w-4" /> Sair
                                        </button>
                                    </div>
                                )}

                                {/* Links de Departamentos */}
                                {DEPARTMENTS.find((d) => d.id === id)?.solutions.map((sol) => (
                                    <Link
                                        key={sol.id}
                                        href={sol.path}
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                            isActive(sol.path)
                                                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                                        {sol.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col items-center bg-[#0F172A] py-4">
            {/* Logo */}
            <div className="mb-8">
                <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-lg shadow-[hsl(var(--primary)/0.3)] hover:scale-105 transition-transform">
                    <Building2 className="h-6 w-6 text-white" />
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto px-2 scrollbar-none">
                {/* Search Trigger */}
                <SidebarItem
                    id="search"
                    icon={Search}
                    label="Busca Rápida"
                    onClick={() => { }} // Implement search modal trigger
                />

                <div className="my-2 h-px w-full bg-white/10" />

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

                <div className="my-2 h-px w-full bg-white/10" />

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
            <div className="mt-auto flex w-full flex-col gap-2 px-2 pt-4">
                <SidebarItem
                    id="notifications"
                    icon={Bell}
                    label="Notificações"
                    badge={3}
                    color="from-yellow-500 to-orange-500"
                />
                <SidebarItem
                    id="help"
                    icon={HelpCircle}
                    label="Ajuda"
                    color="from-green-500 to-emerald-500"
                />
                <div className="my-2 h-px w-full bg-white/10" />
                <SidebarItem
                    id="profile"
                    icon={User}
                    label="Perfil"
                    active={isActive("/settings")} // Highlight if in settings
                />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Rail) */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[80px] flex-col border-r border-white/10 bg-[#0F172A]">
                <SidebarContent />
            </aside>

            {/* Spacer to push content */}
            <div className="hidden lg:block w-[80px] flex-shrink-0" />

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
                        >
                            {/* Mobile uses a different layout or adapts this one - for now reusing content but might need adjustment for mobile width */}
                            <div className="h-full w-full bg-[#0F172A] p-4">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="font-bold text-white text-xl">Menu</span>
                                    <button onClick={() => setMobileOpen(false)}>
                                        <X className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                {/* Simplified Mobile Menu List - could be expanded */}
                                <div className="space-y-4">
                                    <Link href="/dashboard" className="block text-white">Dashboard</Link>
                                    {DEPARTMENTS.map(d => (
                                        <div key={d.id}>
                                            <p className="text-white/50 text-sm mb-2">{d.name}</p>
                                            <div className="pl-4 space-y-2">
                                                {d.solutions.map(s => (
                                                    <Link key={s.id} href={s.path} className="block text-white">{s.name}</Link>
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
                className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-lg shadow-[hsl(var(--primary)/0.3)] lg:hidden"
            >
                <Menu className="h-6 w-6 text-white" />
            </button>
        </>
    );
}
