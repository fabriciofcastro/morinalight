export type SectorPermission = {
  id: string;
  orgId: string;
  sectorId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type SectorPermissionFiltro = {
  sectorId?: string;
  permissionId?: string;
  granted?: boolean;
};

export interface SectorPermissionRepository {
  salvar(permission: SectorPermission): Promise<void>;
  encontrarPorId(orgId: string, id: string): Promise<SectorPermission | null>;
  encontrarPorSectorEPermission(
    orgId: string,
    sectorId: string,
    permissionId: string,
  ): Promise<SectorPermission | null>;
  listarPorOrg(orgId: string, filtro?: SectorPermissionFiltro): Promise<SectorPermission[]>;
  listarPorSector(orgId: string, sectorId: string): Promise<SectorPermission[]>;
  listarPorSectors(orgId: string, sectorIds: string[]): Promise<SectorPermission[]>;
  deletar(orgId: string, id: string): Promise<void>;
  deletarPorSectorEPermission(orgId: string, sectorId: string, permissionId: string): Promise<void>;
}
