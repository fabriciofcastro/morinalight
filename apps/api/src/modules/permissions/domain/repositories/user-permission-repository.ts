export type UserPermission = {
  id: string;
  orgId: string;
  userId: string;
  permissionId: string;
  granted: boolean;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export interface UserPermissionRepository {
  salvar(permission: UserPermission): Promise<void>;
  encontrarPorUserEPermission(
    orgId: string,
    userId: string,
    permissionId: string,
  ): Promise<UserPermission | null>;
  listarPorUser(orgId: string, userId: string): Promise<UserPermission[]>;
  deletarPorUserEPermission(orgId: string, userId: string, permissionId: string): Promise<void>;
}













