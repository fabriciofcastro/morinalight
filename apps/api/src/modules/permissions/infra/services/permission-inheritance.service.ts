/**
 * Permission Inheritance Service Implementation
 * Implementa herança de permissões entre entidades organizacionais
 */

import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import type {
  InheritedPermission,
  PermissionInheritanceService,
} from "../../domain/services/permission-inheritance.service";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  sectorRepository: SectorRepository;
  positionRepository: PositionRepository;
  departmentPermissionRepository: DepartmentPermissionRepository;
  sectorPermissionRepository: SectorPermissionRepository;
  positionPermissionRepository: PositionPermissionRepository;
  permissionRepository: PermissionRepository;
};

export class PermissionInheritanceServiceImpl implements PermissionInheritanceService {
  constructor(private readonly deps: Dependencies) {}

  async resolveDepartmentInheritedPermissions(
    orgId: string,
    departmentId: string,
  ): Promise<InheritedPermission[]> {
    const inherited: InheritedPermission[] = [];
    const visited = new Set<string>(); // Evitar loops

    // Buscar departamento atual
    const department = await this.deps.departmentRepository.encontrarPorId(orgId, departmentId);
    if (!department) {
      return [];
    }

    // Resolver hierarquia de departamentos (subir até a raiz)
    let currentDept: typeof department | null = department;
    let level = 0;

    while (currentDept && !visited.has(currentDept.departmentId)) {
      visited.add(currentDept.departmentId);

      // Buscar permissões diretas do departamento
      const permissions = await this.deps.departmentPermissionRepository.listarPorDepartment(
        orgId,
        currentDept.departmentId,
      );

      for (const perm of permissions) {
        const permission = await this.deps.permissionRepository.encontrarPorId(perm.permissionId);
        if (permission) {
          // Verificar se já existe uma permissão mais próxima (override)
          const existingIndex = inherited.findIndex(
            (p) => p.permissionKey === permission.permissionKey,
          );
          if (existingIndex === -1 || inherited[existingIndex].inheritedFrom.level > level) {
            if (existingIndex !== -1) {
              inherited.splice(existingIndex, 1);
            }
            inherited.push({
              permissionKey: permission.permissionKey,
              granted: perm.granted,
              inheritedFrom: {
                entityType: "department",
                entityId: currentDept.departmentId,
                level,
              },
            });
          }
        }
      }

      // Subir para o departamento pai
      if (currentDept.dados.parentId) {
        currentDept = await this.deps.departmentRepository.encontrarPorId(
          orgId,
          currentDept.dados.parentId,
        );
        level++;
      } else {
        currentDept = null;
      }
    }

    return inherited;
  }

  async resolveSectorInheritedPermissions(
    orgId: string,
    sectorId: string,
  ): Promise<InheritedPermission[]> {
    const inherited: InheritedPermission[] = [];
    const visited = new Set<string>(); // Evitar loops

    // Buscar setor atual
    const sector = await this.deps.sectorRepository.encontrarPorId(orgId, sectorId);
    if (!sector) {
      return [];
    }

    // 1. Resolver hierarquia de setores (subir até a raiz)
    let currentSector: typeof sector | null = sector;
    let level = 0;

    while (currentSector && !visited.has(currentSector.sectorId)) {
      visited.add(currentSector.sectorId);

      // Buscar permissões diretas do setor
      const permissions = await this.deps.sectorPermissionRepository.listarPorSector(
        orgId,
        currentSector.sectorId,
      );

      for (const perm of permissions) {
        const permission = await this.deps.permissionRepository.encontrarPorId(perm.permissionId);
        if (permission) {
          // Verificar se já existe uma permissão mais próxima (override)
          const existingIndex = inherited.findIndex(
            (p) => p.permissionKey === permission.permissionKey,
          );
          if (existingIndex === -1 || inherited[existingIndex].inheritedFrom.level > level) {
            if (existingIndex !== -1) {
              inherited.splice(existingIndex, 1);
            }
            inherited.push({
              permissionKey: permission.permissionKey,
              granted: perm.granted,
              inheritedFrom: {
                entityType: "sector",
                entityId: currentSector.sectorId,
                level,
              },
            });
          }
        }
      }

      // Subir para o setor pai
      if (currentSector.dados.parentId) {
        currentSector = await this.deps.sectorRepository.encontrarPorId(
          orgId,
          currentSector.dados.parentId,
        );
        level++;
      } else {
        currentSector = null;
      }
    }

    // 2. Herdar permissões do departamento pai
    if (sector.dados.departmentId) {
      const departmentPermissions = await this.resolveDepartmentInheritedPermissions(
        orgId,
        sector.dados.departmentId,
      );

      for (const perm of departmentPermissions) {
        // Só adicionar se não houver override do setor
        const existingIndex = inherited.findIndex((p) => p.permissionKey === perm.permissionKey);
        if (existingIndex === -1) {
          inherited.push({
            ...perm,
            inheritedFrom: {
              ...perm.inheritedFrom,
              level: perm.inheritedFrom.level + level + 1, // Ajustar nível
            },
          });
        }
      }
    }

    return inherited;
  }

  async resolvePositionInheritedPermissions(
    orgId: string,
    positionId: string,
  ): Promise<InheritedPermission[]> {
    const inherited: InheritedPermission[] = [];

    // Buscar cargo atual
    const position = await this.deps.positionRepository.encontrarPorId(orgId, positionId);
    if (!position) {
      return [];
    }

    // 1. Buscar permissões diretas do cargo
    const permissions = await this.deps.positionPermissionRepository.listarPorPosition(
      orgId,
      positionId,
    );

    for (const perm of permissions) {
      const permission = await this.deps.permissionRepository.encontrarPorId(perm.permissionId);
      if (permission) {
        inherited.push({
          permissionKey: permission.permissionKey,
          granted: perm.granted,
          inheritedFrom: {
            entityType: "position",
            entityId: positionId,
            level: 0,
          },
        });
      }
    }

    // 2. Herdar permissões do setor pai
    if (position.dados.sectorId) {
      const sectorPermissions = await this.resolveSectorInheritedPermissions(
        orgId,
        position.dados.sectorId,
      );

      for (const perm of sectorPermissions) {
        // Só adicionar se não houver override do cargo
        const existingIndex = inherited.findIndex((p) => p.permissionKey === perm.permissionKey);
        if (existingIndex === -1) {
          inherited.push({
            ...perm,
            inheritedFrom: {
              ...perm.inheritedFrom,
              level: perm.inheritedFrom.level + 1, // Ajustar nível
            },
          });
        }
      }
    }

    return inherited;
  }

  async isPermissionInherited(
    orgId: string,
    entityType: "department" | "sector" | "position",
    entityId: string,
    permissionKey: string,
  ): Promise<{ inherited: boolean; source?: InheritedPermission["inheritedFrom"] }> {
    let inheritedPermissions: InheritedPermission[] = [];

    switch (entityType) {
      case "department":
        inheritedPermissions = await this.resolveDepartmentInheritedPermissions(orgId, entityId);
        break;
      case "sector":
        inheritedPermissions = await this.resolveSectorInheritedPermissions(orgId, entityId);
        break;
      case "position":
        inheritedPermissions = await this.resolvePositionInheritedPermissions(orgId, entityId);
        break;
    }

    const permission = inheritedPermissions.find((p) => p.permissionKey === permissionKey);

    if (!permission) {
      return { inherited: false };
    }

    // Se level > 0, é herdada; se level === 0, é direta
    const isInherited = permission.inheritedFrom.level > 0;

    return {
      inherited: isInherited,
      source: isInherited ? permission.inheritedFrom : undefined,
    };
  }
}
