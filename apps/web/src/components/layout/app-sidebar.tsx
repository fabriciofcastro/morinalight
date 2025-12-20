"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  DollarSign,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
  ClipboardList,
  FileCheck,
  List,
  Plus,
  Network,
  Briefcase,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useHasPermission } from "@/hooks/use-permissions";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: number;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    permission: "dashboard:view",
  },
  {
    label: "Produtos",
    href: "/products",
    icon: Package,
    permission: "products:view",
  },
  {
    label: "Catálogo",
    href: "/catalogo/auditoria",
    icon: FileText,
    permission: "catalog:view",
  },
  {
    label: "Pré-Fichas Técnicas",
    href: "/pre-fichas-tecnicas",
    icon: FileCheck,
    permission: "pre-fichas-tecnicas:view",
  },
  {
    label: "Fichas de Custo",
    href: "/fichas-custo",
    icon: ClipboardList,
    permission: "fichas-custo:view",
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    permission: "clients:view",
  },
  {
    label: "Representantes",
    href: "/representantes",
    icon: UserCog,
    permission: "representatives:view",
  },
  {
    label: "Comissões",
    href: "/comissoes",
    icon: DollarSign,
    permission: "commissions:view",
  },
  {
    label: "Fornecedores",
    href: "/fornecedores/list",
    icon: Building2,
    permission: "suppliers:view",
    children: [
      {
        label: "Lista de Fornecedores",
        href: "/fornecedores/list",
        icon: List,
        permission: "suppliers:view",
      },
      {
        label: "Novo Fornecedor",
        href: "/fornecedores/new",
        icon: Plus,
        permission: "suppliers:create",
      },
    ],
  },
  {
    label: "Vendas",
    href: "/sales",
    icon: ShoppingCart,
    permission: "sales:view",
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    permission: "reports:view",
  },
  {
    label: "Notificações",
    href: "/notifications",
    icon: Bell,
    permission: "notifications:view",
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    permission: "settings:view",
    children: [
      {
        label: "Equipe",
        href: "/settings/team",
        icon: Users,
        permission: "settings:team:view",
      },
      {
        label: "Permissões",
        href: "/settings/permissions",
        icon: UserCog,
        permission: "settings:permissions:view",
        children: [
          {
            label: "Gestão de Permissões",
            href: "/admin/permissions/dashboard",
            icon: Shield,
            permission: "settings:permissions:view",
          },
          {
            label: "Auditoria de Acessos",
            href: "/admin/permissions/access-audit",
            icon: Activity,
            permission: "settings:permissions:view",
          },
        ],
      },
      {
        label: "Estrutura Organizacional",
        href: "/settings/organizational-structure",
        icon: Network,
        permission: "settings:organizational-structure:view",
        children: [
          {
            label: "Departamentos",
            href: "/admin/departments",
            icon: Building2,
            permission: "settings:organizational-structure:view",
          },
          {
            label: "Setores",
            href: "/admin/sectors",
            icon: Briefcase,
            permission: "settings:organizational-structure:view",
          },
          {
            label: "Cargos",
            href: "/admin/positions",
            icon: UserCog,
            permission: "settings:organizational-structure:view",
          },
          {
            label: "Filiais",
            href: "/admin/branches",
            icon: GitBranch,
            permission: "settings:organizational-structure:view",
          },
        ],
      },
      {
        label: "Dados da Empresa",
        href: "/admin/company/edit",
        icon: Building2,
        permission: "settings:company:view",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Expandir automaticamente itens do menu quando o usuário está em uma página filha
  useEffect(() => {
    const newExpanded = new Set<string>();
    
    const checkItem = (item: NavItem) => {
      if (item.children && item.children.length > 0) {
        // Verificar se algum filho está ativo (incluindo filhos aninhados)
        const hasActiveChild = item.children.some((child) => {
          const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
          // Verificar também filhos aninhados
          if (child.children && child.children.length > 0) {
            const hasNestedActive = child.children.some(
              (nested) => pathname === nested.href || pathname.startsWith(`${nested.href}/`)
            );
            if (hasNestedActive) {
              newExpanded.add(child.href);
              return true;
            }
          }
          return isChildActive;
        });
        
        // Verificar se o próprio item está ativo
        const isItemActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        
        if (hasActiveChild || isItemActive) {
          newExpanded.add(item.href);
        }
      }
    };
    
    navItems.forEach(checkItem);
    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };


  return (
    <aside
      className={cn(
        "relative flex h-screen w-[280px] flex-col border-r border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] backdrop-blur-xl",
      )}
    >
      {/* Header da sidebar */}
      <div className="flex h-16 items-center border-b border-[color-mix(in_oklab,var(--border)_90%,transparent)] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm font-bold text-white">
            ML
          </div>
          <span className="font-semibold text-[var(--fg)]">Morina Light</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              pathname={pathname}
              expandedItems={expandedItems}
              onToggleExpand={toggleExpand}
            />
          ))}
        </ul>
      </nav>

      {/* Footer da sidebar */}
      <div className="border-t border-[color-mix(in_oklab,var(--border)_90%,transparent)] p-6">
        <div className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          <p className="font-medium">v1.0.0</p>
          <p className="mt-1">Sistema Operacional</p>
        </div>
      </div>
    </aside>
  );
}

type NavItemComponentProps = {
  item: NavItem;
  pathname: string;
  expandedItems: Set<string>;
  onToggleExpand: (href: string) => void;
};

function NavItemComponent({
  item,
  pathname,
  expandedItems,
  onToggleExpand,
}: NavItemComponentProps) {
  const hasPermission = useHasPermission(item.permission || "");
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const isExpanded = expandedItems.has(item.href);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasPermission) {
    return null;
  }

  return (
    <li>
      <div>
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              onToggleExpand(item.href);
            }
          }}
          className={cn(
            "group flex h-10 items-center gap-3 rounded-lg px-3 transition-all",
            isActive
              ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)] font-medium"
              : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] hover:text-[var(--fg)]",
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          )}
        </Link>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-8 mt-1 space-y-1 overflow-hidden border-l border-[color-mix(in_oklab,var(--border)_90%,transparent)] pl-3"
              >
                {item.children?.map((child) => (
                  <ChildNavItem 
                    key={child.href} 
                    item={child} 
                    pathname={pathname}
                    expandedItems={expandedItems}
                    onToggleExpand={onToggleExpand}
                  />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </div>
    </li>
  );
}

function ChildNavItem({ 
  item, 
  pathname, 
  expandedItems, 
  onToggleExpand 
}: { 
  item: NavItem; 
  pathname: string;
  expandedItems?: Set<string>;
  onToggleExpand?: (href: string) => void;
}) {
  const hasPermission = useHasPermission(item.permission || "");
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems?.has(item.href) ?? false;

  if (!hasPermission) {
    return null;
  }

  return (
    <li>
      <div>
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasChildren && onToggleExpand) {
              e.preventDefault();
              onToggleExpand(item.href);
            }
          }}
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all",
            isActive
              ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)] font-medium"
              : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] hover:text-[var(--fg)]",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {hasChildren && onToggleExpand && (
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          )}
        </Link>

        {hasChildren && onToggleExpand && (
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-6 mt-1 space-y-1 overflow-hidden border-l border-[color-mix(in_oklab,var(--border)_90%,transparent)] pl-3"
              >
                {item.children?.map((nested) => (
                  <ChildNavItem 
                    key={nested.href} 
                    item={nested} 
                    pathname={pathname}
                  />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </div>
    </li>
  );
}
