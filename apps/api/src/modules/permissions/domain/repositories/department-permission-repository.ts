export type DepartmentPermission = {
  id: string;
  orgId: string;
  departmentId: string;
  permissionId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type DepartmentPermissionFiltro = {
  departmentId?: string;
  permissionId?: string;
  granted?: boolean;
};

export interface DepartmentPermissionRepository {
  salvar(permission: DepartmentPermission): Promise<void>;
  encontrarPorId(orgId: string, id: string): Promise<DepartmentPermission | null>;
  encontrarPorDepartmentEPermission(
    orgId: string,
    departmentId: string,
    permissionId: string,
  ): Promise<DepartmentPermission | null>;
  listarPorOrg(orgId: string, filtro?: DepartmentPermissionFiltro): Promise<DepartmentPermission[]>;
  listarPorDepartment(orgId: string, departmentId: string): Promise<DepartmentPermission[]>;
  listarPorDepartments(orgId: string, departmentIds: string[]): Promise<DepartmentPermission[]>;
  deletar(orgId: string, id: string): Promise<void>;
  deletarPorDepartmentEPermission(
    orgId: string,
    departmentId: string,
    permissionId: string,
  ): Promise<void>;
}
