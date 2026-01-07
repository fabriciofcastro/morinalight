import sys
import os

filepath = "/home/fabricio/projects/morinalight/apps/web/src/components/layout/EnterpriseSidebar.tsx"

new_departments = """const DEPARTMENTS: Department[] = [
  {
    id: "produtos",
    name: "Produtos",
    icon: Package,
    color: "from-blue-500 to-cyan-500",
    solutions: [
      { id: "catalogo", name: "Catálogo", path: "/catalog", description: "Produtos e tabelas de preços.", permission: PermissionKeys.CATALOG_VIEW },
      { id: "produtos-index", name: "Produtos", path: "/products", description: "Visão geral de produtos." },
      { id: "produtos-list", name: "Produtos - Lista", path: "/admin/products/list", description: "Todos os produtos.", permission: PermissionKeys.PRODUCTS_VIEW },
      { id: "produtos-new", name: "Produtos - Novo", path: "/admin/products/new", description: "Criar novo produto.", permission: PermissionKeys.PRODUCTS_CREATE },
      { id: "produtos-import", name: "Produtos - Importar", path: "/admin/products/import", description: "Carga via CSV." },
      { id: "produtos-export", name: "Produtos - Exportar", path: "/admin/products/export", description: "Exportar dados." },
      { id: "pre-fichas", name: "Pré-Fichas Técnicas", path: "/pre-fichas-tecnicas", description: "Gestão inicial." },
      { id: "fichas-custo", name: "Fichas de Custo", path: "/fichas-custo", description: "Index de fichas." },
      { id: "fichas-custo-list", name: "Fichas - Lista", path: "/fichas-custo/list", description: "Lista de fichas." },
      { id: "fichas-custo-new", name: "Fichas - Nova", path: "/fichas-custo/new", description: "Criar nova ficha." },
      { id: "fichas-status", name: "Fichas - Status", path: "/fichas-custo/status-customizados", description: "Gestão de status." },
      { id: "fichas-status-admin", name: "Fichas - Admin Status", path: "/admin/status-customizados-ficha-custo", description: "Configurações de status." },
      { id: "fichas-status-admin-new", name: "Fichas - Novo Status", path: "/admin/status-customizados-ficha-custo/new", description: "Novo status global." },
      { id: "categorias-list", name: "Categorias - Lista", path: "/admin/categories/list", description: "Lista de categorias." },
      { id: "cat-auditoria", name: "Catálogo - Auditoria", path: "/catalogo/auditoria", description: "Logs do catálogo." },
    ],
  },
  {
    id: "producao",
    name: "Produção",
    icon: Shirt,
    color: "from-orange-500 to-amber-500",
    solutions: [
      { id: "insumos", name: "Insumos", path: "/insumos", description: "Gestão de matérias-primas." },
      { id: "insumos-new", name: "Insumos - Novo", path: "/insumos/new", description: "Novo insumo." },
      { id: "qualidade", name: "Qualidade", path: "/producao/qualidade", description: "Controle de qualidade." },
      { id: "colecoes", name: "Coleções", path: "/design/colecoes", description: "Design e Estilo." },
    ],
  },
  {
    id: "logistica",
    name: "Logística",
    icon: Truck,
    color: "from-blue-600 to-indigo-600",
    solutions: [
      { id: "expedicao", name: "Expedição", path: "/logistica/expedicao", description: "Gestão de envios." },
      { id: "estoque-admin", name: "Estoque Admin", path: "/admin/stock", description: "Configuração de estoque." },
    ],
  },
  {
    id: "relacionamentos",
    name: "Relacionamentos",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    solutions: [
      { id: "clientes-legacy", name: "Clientes (Geral)", path: "/clientes", description: "Visão consolidada." },
      { id: "clients-legacy", name: "Clients (API Root)", path: "/clients", description: "Root endpoint." },
      { id: "clientes-lista", name: "Clientes - Lista", path: "/admin/clients/list", description: "Lista detalhada.", permission: PermissionKeys.CLIENTS_VIEW },
      { id: "clientes-novo", name: "Clientes - Novo", path: "/admin/clients/new", description: "Novo cliente.", permission: PermissionKeys.CLIENTS_CREATE },
      { id: "clientes-import", name: "Clientes - Importar", path: "/admin/clients/import", description: "Importar do RD/Planilha.", permission: PermissionKeys.CLIENTS_CREATE },
      { id: "clientes-export", name: "Clientes - Exportar", path: "/admin/clients/export", description: "Relatórios CSV/PDF.", permission: PermissionKeys.CLIENTS_VIEW },
      { id: "fornecedores", name: "Fornecedores", path: "/fornecedores", description: "Dashboard de fornecedores.", permission: PermissionKeys.SUPPLIERS_VIEW },
      { id: "fornecedores-list", name: "Fornecedores - Lista", path: "/fornecedores/list", description: "Lista detalhada.", permission: PermissionKeys.SUPPLIERS_VIEW },
      { id: "fornecedores-new", name: "Fornecedores - Novo", path: "/fornecedores/new", description: "Novo fornecedor.", permission: PermissionKeys.SUPPLIERS_CREATE },
      { id: "fornecedores-import", name: "Fornecedores - Importar", path: "/fornecedores/import", description: "Importação em lote.", permission: PermissionKeys.SUPPLIERS_CREATE },
      { id: "suppliers", name: "Suppliers (Geral)", path: "/suppliers", description: "Visão consolidada." },
      { id: "suppliers-admin", name: "Suppliers (Admin)", path: "/admin/suppliers/list", description: "Gestão admin.", permission: PermissionKeys.SUPPLIERS_VIEW },
      { id: "suppliers-new", name: "Suppliers - Novo", path: "/admin/suppliers/new", description: "Novo supplier admin.", permission: PermissionKeys.SUPPLIERS_CREATE },
      { id: "representantes", name: "Representantes", path: "/representantes", description: "Gestão de representantes." },
      { id: "segmentos", name: "Segmentos", path: "/admin/business-segments", description: "Gestão de segmentos." },
      { id: "segmentos-list", name: "Segmentos - Lista", path: "/admin/business-segments/list", description: "Lista de segmentos." },
      { id: "segmentos-new", name: "Segmentos - Novo", path: "/admin/business-segments/new", description: "Criar novo segmento." },
    ],
  },
  {
    id: "financeiro",
    name: "Financeiro",
    icon: ShoppingCart,
    color: "from-purple-500 to-pink-500",
    solutions: [
      { id: "comissoes", name: "Comissões", path: "/comissoes", description: "Dashboard de comissões.", permission: PermissionKeys.COMMISSIONS_VIEW },
      { id: "comissoes-legacy", name: "Comissões (Legacy)", path: "/commissions", description: "Antiga dashboard.", permission: PermissionKeys.COMMISSIONS_VIEW },
    ],
  },
  {
    id: "analytics",
    name: "Relatórios",
    icon: BarChart3,
    color: "from-violet-500 to-fuchsia-500",
    solutions: [
      { id: "dashboard", name: "Dashboard Principal", path: "/dashboard", description: "Visão 360 do negócio." },
      { id: "analytics-main", name: "Analytics Dashboard", path: "/analytics", description: "Métricas avançadas." },
      { id: "reports", name: "Relatórios Gerenciais", path: "/analytics/reports", description: "Relatórios customizados." },
    ],
  },
  {
    id: "admin",
    name: "Administração",
    icon: Shield,
    color: "from-slate-500 to-zinc-500",
    solutions: [
      { id: "admin-users", name: "Usuários", path: "/admin/users", description: "Dashboard de usuários.", permission: PermissionKeys.USERS_VIEW },
      { id: "admin-users-list", name: "Usuários - Lista", path: "/admin/users/list", description: "Lista completa.", permission: PermissionKeys.USERS_VIEW },
      { id: "admin-users-new", name: "Novo Usuário", path: "/admin/users/new", description: "Criar acesso.", permission: PermissionKeys.USERS_CREATE },
      { id: "admin-users-import", name: "Usuários - Importar", path: "/admin/users/import", description: "Carga em lote.", permission: PermissionKeys.USERS_CREATE },
      { id: "admin-users-export", name: "Usuários - Exportar", path: "/admin/users/export", description: "Exportação CSV.", permission: PermissionKeys.USERS_VIEW },
      { id: "admin-users-checklist", name: "Usuários - Checklist", path: "/admin/users/checklist", description: "Verificação de perfil.", permission: PermissionKeys.USERS_VIEW },
      { id: "users-root", name: "Usuários (Root)", path: "/users", description: "Raiz de usuários." },
      { id: "admin-branches", name: "Filiais", path: "/admin/branches", description: "Dashboard de filiais.", permission: PermissionKeys.BRANCHES_VIEW },
      { id: "admin-branches-list", name: "Filiais - Lista", path: "/admin/branches/list", description: "Lista de unidades.", permission: PermissionKeys.BRANCHES_VIEW },
      { id: "admin-branches-new", name: "Filiais - Nova", path: "/admin/branches/new", description: "Criar filial.", permission: PermissionKeys.BRANCHES_CREATE },
      { id: "admin-branches-dashboard", name: "Filiais - Saúde", path: "/admin/branches/dashboard", description: "KPIs por filial.", permission: PermissionKeys.BRANCHES_VIEW },
      { id: "admin-departments", name: "Departamentos", path: "/admin/departments", description: "Dashboard de depts.", permission: PermissionKeys.DEPARTMENTS_VIEW },
      { id: "admin-departments-list", name: "Departamentos - Lista", path: "/admin/departments/list", description: "Lista estrutura.", permission: PermissionKeys.DEPARTMENTS_VIEW },
      { id: "admin-departments-new", name: "Departamentos - Novo", path: "/admin/departments/new", description: "Novo departamento.", permission: PermissionKeys.DEPARTMENTS_CREATE },
      { id: "admin-subdepts-new", name: "Subdepartamentos - Novo", path: "/admin/subdepartments/new", description: "Nova sub-unidade.", permission: PermissionKeys.DEPARTMENTS_CREATE },
      { id: "admin-sectors", name: "Setores", path: "/admin/sectors", description: "Dashboard de setores.", permission: PermissionKeys.SECTORS_VIEW },
      { id: "admin-sectors-list", name: "Setores - Lista", path: "/admin/sectors/list", description: "Lista de setores.", permission: PermissionKeys.SECTORS_VIEW },
      { id: "admin-sectors-new", name: "Setores - Novo", path: "/admin/sectors/new", description: "Criar setor.", permission: PermissionKeys.SECTORS_CREATE },
      { id: "admin-positions", name: "Cargos", path: "/admin/positions", description: "Dashboard de cargos.", permission: PermissionKeys.POSITIONS_VIEW },
      { id: "admin-positions-list", name: "Cargos - Lista", path: "/admin/positions/list", description: "Lista de cargos.", permission: PermissionKeys.POSITIONS_VIEW },
      { id: "admin-positions-new", name: "Cargos - Novo", path: "/admin/positions/new", description: "Criar cargo.", permission: PermissionKeys.POSITIONS_CREATE },
      { id: "admin-roles", name: "Papéis (Roles)", path: "/admin/roles", description: "Dashboard de perfis.", permission: PermissionKeys.ROLES_VIEW },
      { id: "admin-roles-list", name: "Papéis - Lista", path: "/admin/roles/list", description: "Lista de papéis.", permission: PermissionKeys.ROLES_VIEW },
      { id: "admin-roles-new", name: "Papéis - Novo", path: "/admin/roles/new", description: "Criar papel.", permission: PermissionKeys.ROLES_CREATE },
      { id: "admin-permissions-root", name: "Permissões", path: "/admin/permissions", description: "Dashboard permissões.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-list", name: "Permissões - Lista", path: "/admin/permissions/list", description: "Lista completa.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-new", name: "Permissões - Nova", path: "/admin/permissions/new", description: "Criar permissão.", permission: PermissionKeys.PERMISSIONS_CREATE },
      { id: "admin-permissions-dashboard", name: "Permissões - Monitor", path: "/admin/permissions/dashboard", description: "Estatísticas de acesso.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-matrix", name: "Permissões - Matriz", path: "/admin/permissions/matrix", description: "Matriz de acessos.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-approvals", name: "Permissões - Aprovações", path: "/admin/permissions/approvals", description: "Fila de aprovação.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-access-audit", name: "Permissões - Acesso", path: "/admin/permissions/access-audit", description: "Auditoria de uso.", permission: PermissionKeys.PERMISSIONS_VIEW },
      { id: "admin-permissions-audit-legacy", name: "Permissões - Auditoria", path: "/admin/permissions/audit", description: "Logs de acesso." },
      { id: "admin-workflow-root", name: "Workflows", path: "/admin/workflow-policies", description: "Políticas de aprovação.", permission: PermissionKeys.WORKFLOWS_VIEW },
      { id: "admin-workflow-list", name: "Workflows - Lista", path: "/admin/workflow-policies/list", description: "Lista de fluxos.", permission: PermissionKeys.WORKFLOWS_VIEW },
      { id: "admin-workflow-new", name: "Workflows - Novo", path: "/admin/workflow-policies/new", description: "Criar workflow.", permission: PermissionKeys.WORKFLOWS_CREATE },
      { id: "admin-security", name: "Segurança", path: "/admin/security", description: "Dashboard de segurança.", permission: PermissionKeys.AUDIT_VIEW },
      { id: "admin-audit", name: "Auditoria", path: "/admin/audit", description: "Logs do sistema.", permission: PermissionKeys.AUDIT_VIEW },
      { id: "admin-checklist", name: "Checklist Admin", path: "/admin/checklist", description: "Conformidade global." },
      { id: "admin-company", name: "Empresa", path: "/admin/company", description: "Dados organizacionais." },
      { id: "admin-company-edit", name: "Empresa - Editar", path: "/admin/company/edit", description: "Alterar dados." },
      { id: "admin-notifications-root", name: "Notificações Admin", path: "/admin/notifications", description: "Gestão global." },
      { id: "admin-notifications-list", name: "Notificações - Lista", path: "/admin/notifications/list", description: "Lista de alertas." },
      { id: "admin-notifications-new", name: "Notificações - Nova", path: "/admin/notifications/new", description: "Criar alerta." },
      { id: "admin-certifications", name: "Certificações", path: "/admin/certifications", description: "Gestão ISO/Compliance." },
      { id: "certifications-root", name: "Compliance Certs", path: "/certifications", description: "Root." },
      { id: "certifications-iso", name: "ISO 27001", path: "/certifications/iso27001", description: "Detalhes ISO." },
      { id: "certifications-soc2", name: "SOC 2", path: "/certifications/soc2", description: "Detalhes SOC 2." },
      { id: "certifications-pci", name: "PCI DSS", path: "/certifications/pci-dss", description: "Detalhes PCI." },
      { id: "realtime-lab", name: "Realtime Lab", path: "/admin/realtime-lab", description: "Dev Tools." },
      { id: "error-playground", name: "Error Playground", path: "/admin/error-playground", description: "Dev Testing." },
      { id: "abac-demo", name: "ABAC Demo", path: "/admin/abac-demo", description: "Dev Permissions." },
    ],
  },
  {
    id: "configuracoes",
    name: "Configurações",
    icon: Settings,
    color: "from-indigo-500 to-purple-500",
    solutions: [
      { id: "settings-main", name: "Configurações", path: "/settings", description: "Painel central." },
      { id: "settings-company", name: "Empresa Config", path: "/settings/company", description: "Ajustes da empresa." },
      { id: "settings-profiles", name: "Perfis", path: "/settings/profiles", description: "Gestão de perfis." },
      { id: "settings-users", name: "Usuários Config", path: "/settings/users", description: "Ajustes de usuários." },
      { id: "settings-permissions", name: "Permissões Config", path: "/settings/permissions", description: "Níveis de acesso." },
      { id: "settings-security", name: "Segurança Config", path: "/settings/security", description: "Políticas." },
      { id: "settings-org", name: "Estrutura Org", path: "/settings/organizational-structure", description: "Hierarquia org." },
      { id: "settings-team", name: "Equipe Config", path: "/settings/team", description: "Gestão de equipe." },
      { id: "settings-invites", name: "Convites Config", path: "/settings/invites", description: "Gestão de convites." },
      { id: "settings-notif-pref", name: "Notif. Preferências", path: "/settings/notifications/preferences", description: "Como receber alertas." },
      { id: "profile", name: "Meu Perfil", path: "/profile", description: "Seus dados." },
    ],
  },
  {
    id: "sistema",
    name: "Sistema",
    icon: FileText,
    color: "from-orange-500 to-red-500",
    solutions: [
      { id: "playbook", name: "Playbook", path: "/playbook", description: "Manual de operação." },
      { id: "docs", name: "Documentação", path: "/docs", description: "Guia técnico." },
      { id: "future", name: "Roadmap", path: "/demo/future-improvements", description: "Próximas versões." },
      { id: "inbox", name: "Notificações", path: "/notifications", description: "Inbox de mensagens." },
      { id: "notif-history", name: "Notificações - Histórico", path: "/settings/notifications/history", description: "Alertas antigos." },
    ],
  },
];"""

with open(filepath, 'r') as f:
    lines = f.readlines()

start_line = -1
end_line = -1

for i, line in enumerate(lines):
    if "const DEPARTMENTS: Department[] = [" in line:
        start_line = i
    if start_line != -1 and "];" in line and i > start_line:
        if i + 2 < len(lines) and "type SidebarItemProps" in lines[i+2]:
            end_line = i
            break
        end_line = i

if start_line != -1 and end_line != -1:
    new_lines = lines[:start_line] + [new_departments + "\n"] + lines[end_line+1:]
    with open(filepath, 'w') as f:
        f.writelines(new_lines)
    print(f"Successfully replaced lines {start_line+1} to {end_line+1}")
else:
    print(f"Error: Could not find boundaries (start={start_line}, end={end_line})")
    sys.exit(1)
