export type PositionPermission = {
  id: string;
  orgId: string;
  positionId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type PositionPermissionFiltro = {
  positionId?: string;
  permissionId?: string;
  granted?: boolean;
};

export interface PositionPermissionRepository {
  salvar(permission: PositionPermission): Promise<void>;
  encontrarPorId(orgId: string, id: string): Promise<PositionPermission | null>;
  encontrarPorPositionEPermission(
    orgId: string,
    positionId: string,
    permissionId: string,
  ): Promise<PositionPermission | null>;
  listarPorOrg(orgId: string, filtro?: PositionPermissionFiltro): Promise<PositionPermission[]>;
  listarPorPosition(orgId: string, positionId: string): Promise<PositionPermission[]>;
  listarPorPositions(orgId: string, positionIds: string[]): Promise<PositionPermission[]>;
  deletar(orgId: string, id: string): Promise<void>;
  deletarPorPositionEPermission(
    orgId: string,
    positionId: string,
    permissionId: string,
  ): Promise<void>;
}

