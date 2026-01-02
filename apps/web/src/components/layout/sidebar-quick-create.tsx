"use client";

import { cn } from "@morina/ui";
import { Plus, Users, Package, Building2, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";

interface SidebarQuickCreateProps {
    isExpanded?: boolean;
}

export function SidebarQuickCreate({ isExpanded = true }: SidebarQuickCreateProps) {
    const ability = useAbility();

    // Ação contextual baseada na página atual
    const getQuickCreateAction = () => {
        const canCreateUser = ability.can('create', 'User');
        const canCreateClient = ability.can('create', 'Client');
        const canCreateProduct = ability.can('create', 'Product');
        const canCreateSupplier = ability.can('create', 'Supplier');
        const canCreateTechnicalSheet = ability.can('create', 'TechnicalSheet');

        if ((pathname.includes("/clientes") || pathname.includes("/customers")) && canCreateClient)
            return {
                label: "Novo Cliente",
                href: "/clientes/new",
                icon: Users,
            };
        if ((pathname.includes("/products") || pathname.includes("/produtos")) && canCreateProduct)
            return {
                label: "Novo Produto",
                href: "/products/new",
                icon: Package,
            };
        if (pathname.includes("/fornecedores") && canCreateSupplier)
            return {
                label: "Novo Fornecedor",
                href: "/fornecedores/new",
                icon: Building2,
            };
        if (pathname.includes("/fichas-custo") && canCreateTechnicalSheet)
            return {
                label: "Nova Ficha",
                href: "/fichas-custo/new",
                icon: FileText,
            };
        if (pathname.includes("/admin/users") && canCreateUser)
            return {
                label: "Novo Usuário",
                href: "/admin/users/new",
                icon: Users,
            };

        // Se nenhuma ação contextual é permitida, ou não há contexto, retorna null ou uma ação genérica protegida
        return null;
    };

    const action = getQuickCreateAction();
    if (!action || !isExpanded) return null;

    const Icon = action.icon;

    return (
        <div className="px-3 pb-3">
            <button
                onClick={() => (window.location.href = action.href)}
                className="w-full group relative overflow-hidden rounded-lg p-[1px] hover:p-[2px] transition-all duration-200 cursor-pointer"
                style={{
                    background:
                        "linear-gradient(135deg, var(--primary), var(--secondary))",
                }}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-[7px] px-3 py-2 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white flex-shrink-0" />
                    <span className="flex-1 text-xs font-bold text-white truncate">
                        {action.label}
                    </span>
                    <kbd className="hidden group-hover:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono bg-white/20 text-white rounded">
                        ⌘N
                    </kbd>
                </div>
            </button>
        </div>
    );
}
