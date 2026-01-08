import { PermissionKeys } from "@morina/shared-kernel";

export type PermissionDefinition = {
  key: string;
  name: string;
  description: string;
  module: string;
  level: "read" | "write" | "manage" | "execute";
};

export class PermissionsRegistryService {
  private static definitions: PermissionDefinition[] = [
    // --- DASHBOARD ---
    {
      key: PermissionKeys.DASHBOARD_VIEW,
      name: "Visualizar Dashboard",
      description: "Acesso aos indicadores principais.",
      module: "dashboard",
      level: "read",
    },

    // --- PRODUCTS ---
    {
      key: PermissionKeys.PRODUCTS_VIEW,
      name: "Visualizar Produtos",
      description: "Listar e ver detalhes de produtos.",
      module: "catalog",
      level: "read",
    },
    {
      key: PermissionKeys.PRODUCTS_CREATE,
      name: "Criar Produtos",
      description: "Cadastrar novos produtos.",
      module: "catalog",
      level: "write",
    },
    {
      key: PermissionKeys.PRODUCTS_EDIT,
      name: "Editar Produtos",
      description: "Editar qualquer produto.",
      module: "catalog",
      level: "write",
    },
    {
      key: PermissionKeys.PRODUCTS_EDIT_OWN,
      name: "Editar Meus Produtos",
      description: "Editar apenas produtos criados pelo usuário.",
      module: "catalog",
      level: "write",
    },

    // --- CLIENTS ---
    {
      key: PermissionKeys.CLIENTS_VIEW,
      name: "Visualizar Clientes",
      description: "Acesso à base de clientes.",
      module: "crm",
      level: "read",
    },
    {
      key: PermissionKeys.CLIENTS_EXPORT,
      name: "Exportar Clientes",
      description: "Gerar relatórios/arquivos de clientes.",
      module: "crm",
      level: "read",
    },
    {
      key: PermissionKeys.CLIENTS_IMPORT,
      name: "Importar Clientes",
      description: "Upload de arquivos de clientes.",
      module: "crm",
      level: "write",
    },

    // --- SETTINGS ---
    {
      key: PermissionKeys.SETTINGS_VIEW,
      name: "Acessar Configurações",
      description: "Acesso ao painel de configurações.",
      module: "settings",
      level: "read",
    },
    {
      key: PermissionKeys.PERMISSIONS_VIEW,
      name: "Visualizar Permissões",
      description: "Ver a matriz de permissões e perfis.",
      module: "admin",
      level: "read",
    },
    {
      key: PermissionKeys.PERMISSIONS_MANAGE,
      name: "Gerenciar Permissões",
      description: "Criar/Editar permissões e perfis.",
      module: "admin",
      level: "manage",
    },
    {
      key: PermissionKeys.USERS_VIEW,
      name: "Visualizar Usuários",
      description: "Listar usuários da organização.",
      module: "admin",
      level: "read",
    },
    {
      key: PermissionKeys.WORKFLOWS_VIEW,
      name: "Visualizar Workflows",
      description: "Visualizar políticas de aprovação e workflows.",
      module: "settings",
      level: "read",
    },
  ];

  static getAllDefinitions(): PermissionDefinition[] {
    return PermissionsRegistryService.definitions;
  }

  static getDefinition(key: string): PermissionDefinition | undefined {
    return PermissionsRegistryService.definitions.find((d) => d.key === key);
  }
}
