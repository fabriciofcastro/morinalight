"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ChevronDown,
    ChevronRight,
    Settings,
    Bell,
    User,
    LogOut,
    Menu,
    X,
    Building2,
    Shirt,
    DollarSign,
    Palette,
    Package,
    Users,
    BarChart3,
    FileText,
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
    const [collapsed, setCollapsed] = useState(false);
    const [expandedDepts, setExpandedDepts] = useState<string[]>(["comercial"]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleDepartment = (deptId: string) => {
        setExpandedDepts((prev) =>
            prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
        );
    };

    const isActive = (path: string) => pathname === path;

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight">MORINA</span>
                            <span className="text-[10px] text-white/50 font-medium">Enterprise System</span>
                        </div>
                    )}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                    <Menu className="h-4 w-4" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {/* Dashboard */}
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive("/dashboard")
                            ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary)/0.1)]"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Departments */}
                <div className="pt-4 space-y-1">
                    {!collapsed && (
                        <div className="px-3 pb-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                                Departamentos
                            </p>
                        </div>
                    )}

                    {DEPARTMENTS.map((dept) => {
                        const Icon = dept.icon;
                        const isExpanded = expandedDepts.includes(dept.id);
                        const hasActiveSolution = dept.solutions.some((sol) => isActive(sol.path));

                        return (
                            <div key={dept.id}>
                                {/* Department Header */}
                                <button
                                    onClick={() => toggleDepartment(dept.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                        hasActiveSolution
                                            ? "bg-white/10 text-white"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", dept.color, "shadow-lg")}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{dept.name}</span>
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </>
                                    )}
                                </button>

                                {/* Solutions */}
                                <AnimatePresence>
                                    {isExpanded && !collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-11 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                                                {dept.solutions.map((solution) => (
                                                    <Link
                                                        key={solution.id}
                                                        href={solution.path}
                                                        className={cn(
                                                            "block rounded-md px-3 py-1.5 text-sm transition-all",
                                                            isActive(solution.path)
                                                                ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium"
                                                                : "text-white/60 hover:bg-white/5 hover:text-white/90"
                                                        )}
                                                    >
                                                        {solution.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Analytics */}
                <div className="pt-4">
                    <Link
                        href="/analytics"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive("/analytics")
                                ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <BarChart3 className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>Analytics</span>}
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3 space-y-1">
                <Link
                    href="/users"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Users className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Usuários</span>}
                </Link>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Configurações</span>}
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col border-r border-white/10 bg-[#0F172A] transition-all duration-300",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                <SidebarContent />
            </aside>

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
                            <SidebarContent />
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
