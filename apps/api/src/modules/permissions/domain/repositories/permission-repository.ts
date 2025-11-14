import type { Permission } from "../entities/permission";

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
}


