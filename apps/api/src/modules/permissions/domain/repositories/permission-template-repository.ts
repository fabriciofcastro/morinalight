export type PermissionTemplatePermission = {
  permissionId: string;
  granted: boolean;
};

export type PermissionTemplate = {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  entityType: "position" | "sector" | "department" | "all";
  permissions: PermissionTemplatePermission[];
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type PermissionTemplateFilter = {
  entityType?: "position" | "sector" | "department" | "all";
  isDefault?: boolean;
  isSystem?: boolean;
};

export interface PermissionTemplateRepository {
  salvar(template: PermissionTemplate): Promise<void>;
  encontrarPorId(orgId: string, id: string): Promise<PermissionTemplate | null>;
  encontrarPorNomeEEntityType(
    orgId: string,
    name: string,
    entityType: "position" | "sector" | "department" | "all",
  ): Promise<PermissionTemplate | null>;
  listarPorOrg(orgId: string, filtro?: PermissionTemplateFilter): Promise<PermissionTemplate[]>;
  encontrarDefaultPorEntityType(
    orgId: string,
    entityType: "position" | "sector" | "department" | "all",
  ): Promise<PermissionTemplate | null>;
  deletar(orgId: string, id: string): Promise<void>;
  contarPorOrg(orgId: string, filtro?: PermissionTemplateFilter): Promise<number>;
}

