/**
 * Permission Inheritance Service
 * Gerencia herança de permissões entre entidades organizacionais
 */

export type InheritedPermission = {
  permissionKey: string;
  granted: boolean;
  inheritedFrom: {
    entityType: "department" | "sector" | "position";
    entityId: string;
    level: number; // Nível na hierarquia (0 = direto, 1+ = herdado)
  };
};

export interface PermissionInheritanceService {
  /**
   * Resolver permissões herdadas de um departamento
   * Retorna permissões do departamento e de seus pais na hierarquia
   */
  resolveDepartmentInheritedPermissions(
    orgId: string,
    departmentId: string,
  ): Promise<InheritedPermission[]>;

  /**
   * Resolver permissões herdadas de um setor
   * Retorna permissões do setor, do departamento pai e de setores pais na hierarquia
   */
  resolveSectorInheritedPermissions(
    orgId: string,
    sectorId: string,
  ): Promise<InheritedPermission[]>;

  /**
   * Resolver permissões herdadas de um cargo
   * Retorna permissões do cargo e do setor pai
   */
  resolvePositionInheritedPermissions(
    orgId: string,
    positionId: string,
  ): Promise<InheritedPermission[]>;

  /**
   * Verificar se uma permissão específica é herdada
   */
  isPermissionInherited(
    orgId: string,
    entityType: "department" | "sector" | "position",
    entityId: string,
    permissionKey: string,
  ): Promise<{ inherited: boolean; source?: InheritedPermission["inheritedFrom"] }>;
}









