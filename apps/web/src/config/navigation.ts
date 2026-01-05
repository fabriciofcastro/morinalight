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
    Award,
    Lock,
    AlertTriangle,
    Ban,
    Code,
    Bug,
    Upload,
    Download,
    Mail,
    Grid,
    Play,
    Book,
    Inbox,
    Clock,
    Search,
    FileSpreadsheet,
    TrendingUp,
    Target,
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
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Dashboard",
        href: APP_ROUTES.DASHBOARD,
        icon: Home,
        permission: PERMISSIONS.DASHBOARD_VIEW,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PRODUTOS - Expandido com todas as páginas
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Produtos",
        href: "/produtos",
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
        children: [
            {
                label: "Catálogo",
                href: APP_ROUTES.CATALOG,
                icon: FileText,
                permission: PERMISSIONS.CATALOG_VIEW,
            },
            {
                label: "Produtos",
                href: APP_ROUTES.PRODUCTS,
                icon: Package,
                permission: PERMISSIONS.PRODUCTS_VIEW,
            },
            {
                label: "Pré-Fichas Técnicas",
                href: "/pre-fichas-tecnicas",
                icon: FileCheck,
                permission: "pre-fichas-tecnicas:view",
                children: [
                    {
                        label: "Lista",
                        href: "/pre-fichas-tecnicas/list",
                        icon: List,
                    },
                    {
                        label: "Nova Pré-Ficha",
                        href: "/pre-fichas-tecnicas/new",
                        icon: Plus,
                    },
                ],
            },
            {
                label: "Fichas de Custo",
                href: "/fichas-custo",
                icon: ClipboardList,
                permission: "fichas-custo:view",
                children: [
                    {
                        label: "Lista",
                        href: "/fichas-custo/list",
                        icon: List,
                    },
                    {
                        label: "Nova Ficha",
                        href: "/fichas-custo/new",
                        icon: Plus,
                    },
                    {
                        label: "Status Customizado",
                        href: "/fichas-custo/status",
                        icon: Settings,
                    },
                ],
            },
            {
                label: "Categorias",
                href: "/admin/categories/list",
                icon: Grid,
                permission: "categories:view",
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RELACIONAMENTOS - Expandido
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Relacionamentos",
        href: "/relacionamentos",
        icon: Users,
        permission: "relationships:view",
        children: [
            {
                label: "Clientes",
                href: "/clientes",
                icon: Users,
                permission: "clients:view",
                children: [
                    {
                        label: "Lista de Clientes",
                        href: "/admin/clients/list",
                        icon: List,
                    },
                    {
                        label: "Novo Cliente",
                        href: "/admin/clients/new",
                        icon: Plus,
                    },
                    {
                        label: "Importar",
                        href: "/admin/clients/import",
                        icon: Upload,
                    },
                    {
                        label: "Exportar",
                        href: "/admin/clients/export",
                        icon: Download,
                    },
                ],
            },
            {
                label: "Fornecedores",
                href: "/fornecedores",
                icon: Building2,
                permission: "suppliers:view",
                children: [
                    {
                        label: "Lista",
                        href: "/fornecedores/list",
                        icon: List,
                    },
                    {
                        label: "Novo Fornecedor",
                        href: "/fornecedores/new",
                        icon: Plus,
                    },
                ],
            },
            {
                label: "Representantes",
                href: "/representantes",
                icon: UserCog,
                permission: "representatives:view",
            },
            {
                label: "Segmentos de Negócio",
                href: "/admin/business-segments",
                icon: Briefcase,
                permission: "business-segments:view",
                children: [
                    {
                        label: "Lista",
                        href: "/admin/business-segments/list",
                        icon: List,
                    },
                    {
                        label: "Novo Segmento",
                        href: "/admin/business-segments/new",
                        icon: Plus,
                    },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSAÇÕES
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
    // ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Relatórios",
        href: "/reports",
        icon: BarChart3,
        permission: "reports:view",
        children: [
            {
                label: "Relatórios Gerenciais",
                href: "/reports/management",
                icon: TrendingUp,
            },
            {
                label: "Relatórios Financeiros",
                href: "/reports/financial",
                icon: DollarSign,
            },
            {
                label: "Relatórios Operacionais",
                href: "/reports/operational",
                icon: Activity,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMINISTRAÇÃO - Muito Expandido
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Administração",
        href: "/admin",
        icon: Shield,
        permission: "admin:view",
        children: [
            {
                label: "Usuários",
                href: "/admin/users",
                icon: Users,
                permission: "users:view",
                children: [
                    {
                        label: "Lista de Usuários",
                        href: "/admin/users/list",
                        icon: List,
                    },
                    {
                        label: "Novo Usuário",
                        href: "/admin/users/new",
                        icon: Plus,
                    },
                    {
                        label: "Importar Usuários",
                        href: "/admin/users/import",
                        icon: Upload,
                    },
                    {
                        label: "Convites Pendentes",
                        href: "/invite",
                        icon: Mail,
                    },
                ],
            },
            {
                label: "Permissões",
                href: "/admin/permissions",
                icon: Shield,
                permission: "permissions:view",
                children: [
                    {
                        label: "Dashboard",
                        href: "/admin/permissions/dashboard",
                        icon: BarChart3,
                    },
                    {
                        label: "Matriz de Permissões",
                        href: "/admin/permissions/matrix",
                        icon: Grid,
                    },
                    {
                        label: "Auditoria de Acesso",
                        href: "/admin/permissions/access-audit",
                        icon: Activity,
                    },
                    {
                        label: "Aprovações Pendentes",
                        href: "/admin/permissions/approvals",
                        icon: CheckSquare,
                    },
                    {
                        label: "Lista de Permissões",
                        href: "/admin/permissions/list",
                        icon: List,
                    },
                ],
            },
            {
                label: "Papéis",
                href: "/admin/roles",
                icon: CheckSquare,
                permission: "roles:view",
            },
            {
                label: "Segurança",
                href: "/admin/security",
                icon: Lock,
                permission: "security:view",
                children: [
                    {
                        label: "Logs de Auditoria",
                        href: "/admin/audit",
                        icon: FileText,
                    },
                    {
                        label: "Tentativas de Login",
                        href: "/admin/security/login-attempts",
                        icon: AlertTriangle,
                    },
                    {
                        label: "IPs Bloqueados",
                        href: "/admin/security/blocked-ips",
                        icon: Ban,
                    },
                    {
                        label: "Sessões Ativas",
                        href: "/admin/security/sessions",
                        icon: Activity,
                    },
                ],
            },
            {
                label: "Conformidade",
                href: "/admin/certifications",
                icon: Award,
                permission: "certifications:view",
                children: [
                    {
                        label: "Certificações",
                        href: "/certifications",
                        icon: Award,
                    },
                    {
                        label: "Checklist",
                        href: "/admin/checklist",
                        icon: BookOpen,
                    },
                ],
            },
            {
                label: "Ferramentas Dev",
                href: "/admin/dev",
                icon: Code,
                permission: "dev:view",
                children: [
                    {
                        label: "ABAC Demo",
                        href: "/admin/abac-demo",
                        icon: Shield,
                    },
                    {
                        label: "Error Playground",
                        href: "/admin/error-playground",
                        icon: Bug,
                    },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCUMENTAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Documentação",
        href: "/docs",
        icon: BookOpen,
        permission: "docs:view",
        children: [
            {
                label: "Playbook",
                href: "/playbook",
                icon: Book,
            },
            {
                label: "Documentação Técnica",
                href: "/docs",
                icon: FileText,
            },
            {
                label: "Demos",
                href: "/demo",
                icon: Play,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFICAÇÕES - Expandido
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Notificações",
        href: "/notifications",
        icon: Bell,
        permission: "notifications:view",
        children: [
            {
                label: "Caixa de Entrada",
                href: "/notifications",
                icon: Inbox,
            },
            {
                label: "Configurar",
                href: "/admin/notifications/list",
                icon: Settings,
            },
            {
                label: "Nova Notificação",
                href: "/admin/notifications/new",
                icon: Plus,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURAÇÕES - Mantido e Expandido
    // ═══════════════════════════════════════════════════════════════════════════
    {
        label: "Configurações",
        href: "/settings",
        icon: Settings,
        permission: "settings:view",
        children: [
            {
                label: "Dados da Empresa",
                href: "/admin/company/edit",
                icon: Building2,
                permission: "settings:company:view",
            },
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
                        children: [
                            {
                                label: "Lista de Filiais",
                                href: "/admin/branches/list",
                                icon: List,
                            },
                            {
                                label: "Nova Filial",
                                href: "/admin/branches/new",
                                icon: Plus,
                            },
                            {
                                label: "Dashboard",
                                href: "/admin/branches/dashboard",
                                icon: BarChart3,
                            },
                        ],
                    },
                    {
                        label: "Departamentos",
                        href: "/admin/departments",
                        icon: Building2,
                        permission: "settings:organizational-structure:view",
                        children: [
                            {
                                label: "Lista",
                                href: "/admin/departments/list",
                                icon: List,
                            },
                            {
                                label: "Novo Departamento",
                                href: "/admin/departments/new",
                                icon: Plus,
                            },
                        ],
                    },
                    {
                        label: "Setores",
                        href: "/admin/sectors",
                        icon: Briefcase,
                        permission: "settings:organizational-structure:view",
                        children: [
                            {
                                label: "Lista",
                                href: "/admin/sectors/list",
                                icon: List,
                            },
                            {
                                label: "Novo Setor",
                                href: "/admin/sectors/new",
                                icon: Plus,
                            },
                        ],
                    },
                    {
                        label: "Cargos",
                        href: "/admin/positions",
                        icon: UserCog,
                        permission: "settings:organizational-structure:view",
                        children: [
                            {
                                label: "Lista",
                                href: "/admin/positions/list",
                                icon: List,
                            },
                            {
                                label: "Novo Cargo",
                                href: "/admin/positions/new",
                                icon: Plus,
                            },
                        ],
                    },
                ],
            },
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
            },
        ],
    },
];
