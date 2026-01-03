import {
    BarChart3,
    Bell,
    Building2,
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
    CheckSquare,
    Shield,
    Activity,
    BookOpen,
} from "lucide-react";
import { PERMISSIONS } from "./permissions";
import { APP_ROUTES } from "./routes";

export type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    badge?: number;
    children?: NavItem[];
};

export const navItems: NavItem[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // VISÃO GERAL
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Dashboard",
        href: APP_ROUTES.DASHBOARD,
        icon: Home,
        permission: PERMISSIONS.DASHBOARD_VIEW,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NÚCLEO DE NEGÓCIO - Produtos & Desenvolvimento
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Produtos",
        href: APP_ROUTES.PRODUCTS,
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
    },
    {
        label: "Catálogo",
        href: APP_ROUTES.CATALOG,
        icon: FileText,
        permission: PERMISSIONS.CATALOG_VIEW,
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

    // ═══════════════════════════════════════════════════════════════════════════
    // RELACIONAMENTOS - Pessoas & Entidades
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Clientes",
        href: "/clientes",
        icon: Users,
        permission: "clients:view",
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
        label: "Representantes",
        href: "/representantes",
        icon: UserCog,
        permission: "representatives:view",
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSAÇÕES - Vendas & Finanças
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Vendas",
        href: "/sales",
        icon: ShoppingCart,
        permission: "sales:view",
    },
    {
        label: "Comissões",
        href: "/comissoes",
        icon: DollarSign,
        permission: "commissions:view",
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ANALYTICS & COMUNICAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURAÇÕES & ADMINISTRAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Configurações",
        href: "/settings",
        icon: Settings,
        permission: "settings:view",
        children: [
            // ─────────────────────────────────────────────────────────────────────────
            // Dados da Empresa (Primeiro - Base de tudo)
            // ─────────────────────────────────────────────────────────────────────────
            {
                label: "Dados da Empresa",
                href: "/admin/company/edit",
                icon: Building2,
                permission: "settings:company:view",
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Estrutura Organizacional
            // ─────────────────────────────────────────────────────────────────────────
            {
                label: "Estrutura Organizacional",
                href: "/settings/organizational-structure",
                icon: Network,
                permission: "settings:organizational-structure:view",
                children: [
                    {
                        label: "Filiais",
                        href: "/admin/branches",
                        icon: GitBranch,
                        permission: "settings:organizational-structure:view",
                    },
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
                ],
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Administração de Acesso
            // ─────────────────────────────────────────────────────────────────────────
            {
                label: "Administração",
                href: "/admin",
                icon: Shield,
                permission: "settings:view",
                children: [
                    {
                        label: "Usuários",
                        href: "/admin/users/list",
                        icon: Users,
                        permission: "users:view",
                    },
                    {
                        label: "Papéis",
                        href: "/admin/roles",
                        icon: CheckSquare,
                        permission: "settings:roles:view",
                    },
                    {
                        label: "Permissões",
                        href: "/admin/permissions/dashboard",
                        icon: Shield,
                        permission: "settings:permissions:view",
                    },
                    {
                        label: "Conformidade",
                        href: "/admin/certifications",
                        icon: Award,
                        permission: "settings:certifications:view",
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────────
            // Equipe & Sistema
            // ─────────────────────────────────────────────────────────────────────────
            {
                label: "Equipe",
                href: "/settings/team",
                icon: Users,
                permission: "settings:team:view",
            },
            {
                label: "Monitoramento",
                href: "/admin/checklist",
                icon: Activity,
                permission: "settings:view",
                children: [
                    {
                        label: "Checklist Consolidado",
                        href: "/admin/checklist",
                        icon: BookOpen,
                        permission: "settings:view",
                    },
                ],
            },
        ],
    },
];
