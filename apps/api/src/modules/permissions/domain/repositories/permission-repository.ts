import type { Permission } from "../entities/permission";
import type { SecurityPolicy, ObjectAccessEntry } from "@morina/shared-kernel";

export type PermissionFiltro = {
  module?: string;
  category?: string;
  resource?: string;
  busca?: string;
};

export interface PermissionRepository {
  salvar(permission: Permission): Promise<void>;
  encontrarPorId(permissionId: string): Promise<Permission | null>;
  encontrarPorChave(resource: string, action: string): Promise<Permission | null>;
  listar(filtro?: PermissionFiltro): Promise<Permission[]>;
  encontrarPorIds(ids: string[]): Promise<Permission[]>;
  deletar(permissionId: string): Promise<void>;

  // Advanced ACL & Policy
  listarSecurityPolicies(orgId: string): Promise<SecurityPolicy[]>;
  listarAclEntries(orgId: string, userId: string, role?: string): Promise<ObjectAccessEntry[]>;
}
