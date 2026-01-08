import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    Book,
    BookOpen,
    Briefcase,
    Building2,
    Code,
    DollarSign,
    FileCheck,
    FileText,
    GitBranch,
    Grid,
    HeartHandshake,
    Home,
    Key,
    List,
    Lock,
    Package,
    Plus,
    Settings,
    Shield,
    ShoppingCart,
    Target,
    UserCog,
    Users
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
    // CORE
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Dashboard",
        href: APP_ROUTES.DASHBOARD,
        icon: Home,
        permission: PERMISSIONS.DASHBOARD_VIEW,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ESTRUTURA CORPORATIVA
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Estrutura Corporativa",
        href: "/structure",
        icon: Building2,
        permission: "settings:organizational-structure:view",
        children: [
            {
                label: "Filiais",
                href: "/admin/branches/list",
                icon: GitBranch,
                permission: "settings:organizational-structure:view",
                children: [
                    { label: "Lista", href: "/admin/branches/list", icon: List },
                    { label: "Nova Filial", href: "/admin/branches/new", icon: Plus },
                    { label: "Dashboard", href: "/admin/branches/dashboard", icon: BarChart3 },
                ],
            },
            {
                label: "Departamentos",
                href: "/admin/departments/list",
                icon: Grid,
                children: [
                    { label: "Lista", href: "/admin/departments/list", icon: List },
                    { label: "Novo Departamento", href: "/admin/departments/new", icon: Plus },
                ],
            },
            {
                label: "Setores",
                href: "/admin/sectors/list",
                icon: Package, // Representing specific areas
                children: [
                    { label: "Lista", href: "/admin/sectors/list", icon: List },
                    { label: "Novo Setor", href: "/admin/sectors/new", icon: Plus },
                ],
            },
            {
                label: "Cargos e Funções",
                href: "/admin/positions/list",
                icon: Briefcase,
                permission: "settings:organizational-structure:view",
                children: [
                    { label: "Lista", href: "/admin/positions/list", icon: List },
                    { label: "Novo Cargo", href: "/admin/positions/new", icon: Plus },
                ],
            },
            {
                label: "Segmentos de Negócio",
                href: "/admin/business-segments/list",
                icon: Target,
                permission: "business-segments:view",
                children: [
                    { label: "Lista", href: "/admin/business-segments/list", icon: List },
                    { label: "Novo Segmento", href: "/admin/business-segments/new", icon: Plus },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // OPERAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Catálogo & Produtos",
        href: "/produtos",
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
        children: [
            { label: "Catálogo Digital", href: APP_ROUTES.CATALOG, icon: BookOpen },
            { label: "Produtos", href: APP_ROUTES.PRODUCTS, icon: List },
            { 
                label: "Engenharia", 
                href: "/engineering", 
                icon: Code,
                children: [
                     { label: "Pré-Fichas", href: "/admin/pre-technical-sheets/list", icon: FileCheck },
                     { label: "Fichas de Custo", href: "/admin/cost-sheets/list", icon: DollarSign },
                ]
            },
            { label: "Categorias", href: "/admin/categories/list", icon: Grid },
        ],
    },
    {
        label: "Gestão Comercial",
        href: "/sales",
        icon: ShoppingCart,
        permission: "sales:view",
        children: [
            { label: "Pedidos", href: "/sales/orders", icon: FileText },
            { label: "Comissões", href: "/admin/commissions/list", icon: DollarSign },
        ]
    },
    {
        label: "Parceiros",
        href: "/partners",
        icon: Users,
        children: [
            { label: "Clientes", href: "/admin/clients/list", icon: UserCog },
            { label: "Fornecedores", href: "/admin/suppliers/list", icon: Building2 },
            { label: "Representantes", href: "/admin/representatives/list", icon: Briefcase },
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMINISTRAÇÃO E SISTEMA
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Inteligência",
        href: "/reports",
        icon: BarChart3,
        children: [
            { label: "Dashboards", href: "/reports/dashboards", icon: Grid },
            { label: "Relatórios", href: "/reports/list", icon: FileText },
        ]
    },
    {
        label: "Administração",
        href: "/admin",
        icon: Shield,
        permission: "admin:view",
        children: [
            {
                label: "Controle de Acesso",
                href: "/admin/access",
                icon: Lock,
                children: [
                   { label: "Usuários", href: "/admin/users/list", icon: Users },
                   { label: "Permissões", href: "/admin/permissions/list", icon: Key },
                   { label: "Papéis (Roles)", href: "/admin/roles/list", icon: Shield },
                ]
            },
            {
                label: "Segurança & Auditoria",
                href: "/admin/security",
                icon: AlertTriangle,
                children: [
                    { label: "Logs de Auditoria", href: "/admin/audit", icon: FileText },
                    { label: "Sessões", href: "/admin/security/sessions", icon: Activity },
                ]
            },
            {
                label: "Configurações Globais",
                href: "/settings",
                icon: Settings,
                children: [
                    { label: "Dados da Empresa", href: "/admin/company/edit", icon: Building2 },
                    { label: "Notificações", href: "/admin/notifications/list", icon: Bell },
                    { label: "Políticas de Workflow", href: "/admin/workflow-policies/list", icon: GitBranch },
                ]
            }
        ],
    },
    {
         label: "Ajuda & Docs",
         href: "/docs",
         icon: Book,
         children: [
             { label: "Playbook", href: "/playbook", icon: BookOpen },
             { label: "Suporte", href: "/support", icon: HeartHandshake },
         ]
    }
];
