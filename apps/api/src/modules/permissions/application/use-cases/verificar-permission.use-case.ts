import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import { verificarPermissionInputSchema } from "../schemas/user-permission.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  positionRepository?: PositionRepository;
};

export class VerificarPermissionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown): Promise<{ hasPermission: boolean; reason?: string }> {
    const input = verificarPermissionInputSchema.parse(rawInput);

    // Buscar membership do usuário
    const membership = await this.deps.organizationRepository.encontrarMembership?.(
      input.orgId,
      input.userId,
    );

    if (!membership) {
      return {
        hasPermission: false,
        reason: "Usuário não é membro da organização",
      };
    }

    // Parsear permission (formato: "resource:action")
    const [resource, action] = input.permission.split(":");
    if (!resource || !action) {
      return {
        hasPermission: false,
        reason: "Formato de permissão inválido. Use: resource:action",
      };
    }

    // Buscar permissão
    const permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);

    if (!permission) {
      // Se a permissão não existe no banco, verificar baseado no role
      return {
        hasPermission: this.hasPermissionForRole(membership.role, input.permission),
      };
    }

    // Verificar se o role tem a permissão
    const rolePermissions = this.getPermissionsForRole(membership.role);
    let hasRolePermission = rolePermissions.includes(permission.permissionKey);

    // Verificar permissões dos departamentos do usuário (sobrescrevem role)
    if (this.deps.departmentMembershipRepository && this.deps.departmentPermissionRepository) {
      const departmentMemberships = await this.deps.departmentMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );

      if (departmentMemberships.length > 0) {
        const departmentIds = departmentMemberships.map((m) => m.departmentId);
        const departmentPermissions =
          await this.deps.departmentPermissionRepository.listarPorDepartments(
            input.orgId,
            departmentIds,
          );

        for (const dp of departmentPermissions) {
          let permissionKey = dp.permissionId;
          try {
            const deptPermission = await this.deps.permissionRepository.encontrarPorId(
              dp.permissionId,
            );
            if (deptPermission) {
              permissionKey = deptPermission.permissionKey;
            }
          } catch {
            permissionKey = dp.permissionId;
          }

          if (permissionKey === permission.permissionKey) {
            if (dp.granted) {
              hasRolePermission = true;
            } else {
              return {
                hasPermission: false,
                reason: "Permissão negada explicitamente pelo departamento",
              };
            }
          }
        }
      }
    }

    // Verificar permissões dos setores do usuário (buscar através dos cargos)
    if (
      this.deps.positionMembershipRepository &&
      this.deps.sectorPermissionRepository &&
      this.deps.positionRepository
    ) {
      const positionMemberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );

      if (positionMemberships.length > 0) {
        const positionIds = positionMemberships.map((m) => m.positionId);
        const positions = await Promise.all(
          positionIds.map((positionId) =>
            this.deps.positionRepository?.encontrarPorId(input.orgId, positionId),
          ),
        );

        const sectorIds = positions.filter((p) => p !== null).map((p) => p?.dados.sectorId);

        if (sectorIds.length > 0) {
          const sectorPermissions = await this.deps.sectorPermissionRepository.listarPorSectors(
            input.orgId,
            sectorIds,
          );

          for (const sp of sectorPermissions) {
            let permissionKey = sp.permissionId;
            try {
              const sectorPermission = await this.deps.permissionRepository.encontrarPorId(
                sp.permissionId,
              );
              if (sectorPermission) {
                permissionKey = sectorPermission.permissionKey;
              }
            } catch {
              permissionKey = sp.permissionId;
            }

            if (permissionKey === permission.permissionKey) {
              if (sp.granted) {
                hasRolePermission = true;
              } else {
                return {
                  hasPermission: false,
                  reason: "Permissão negada explicitamente pelo setor",
                };
              }
            }
          }
        }
      }
    }

    // Verificar permissões dos cargos do usuário (sobrescrevem setor, departamento e role)
    if (this.deps.positionMembershipRepository && this.deps.positionPermissionRepository) {
      const positionMemberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );

      if (positionMemberships.length > 0) {
        const positionIds = positionMemberships.map((m) => m.positionId);
        const positionPermissions = await this.deps.positionPermissionRepository.listarPorPositions(
          input.orgId,
          positionIds,
        );

        // Verificar se há permissão explícita nos cargos
        for (const pp of positionPermissions) {
          let permissionKey = pp.permissionId;
          try {
            const posPermission = await this.deps.permissionRepository.encontrarPorId(
              pp.permissionId,
            );
            if (posPermission) {
              permissionKey = posPermission.permissionKey;
            }
          } catch {
            permissionKey = pp.permissionId;
          }

          if (permissionKey === permission.permissionKey) {
            if (pp.granted) {
              hasRolePermission = true;
            } else {
              // Negação explícita sobrescreve tudo
              return {
                hasPermission: false,
                reason: "Permissão negada explicitamente pelo cargo",
              };
            }
          }
        }
      }
    }

    // TODO: Verificar permissões customizadas do usuário

    return {
      hasPermission: hasRolePermission,
    };
  }

  private getPermissionsForRole(role: string): string[] {
    const rolePermissionsMap: Record<string, string[]> = {
      owner: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "products:delete",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "clients:delete",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "commissions:pay",
        "suppliers:view",
        "sales:view",
        "reports:view",
        "settings:view",
        "settings:company:view",
        "settings:team:view",
        "settings:permissions:view",
      ],
      admin: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "products:delete",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "commissions:pay",
        "suppliers:view",
        "sales:view",
        "reports:view",
        "settings:view",
        "settings:company:view",
        "settings:team:view",
      ],
      manager: [
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "catalog:view",
        "clients:view",
        "clients:create",
        "clients:edit",
        "representatives:view",
        "representatives:create",
        "commissions:view",
        "sales:view",
        "reports:view",
      ],
      member: [
        "dashboard:view",
        "products:view",
        "catalog:view",
        "clients:view",
        "representatives:view",
        "commissions:view",
        "sales:view",
      ],
      viewer: [
        "dashboard:view",
        "products:view",
        "catalog:view",
        "clients:view",
        "representatives:view",
        "commissions:view",
      ],
    };

    return rolePermissionsMap[role] || [];
  }

  private hasPermissionForRole(role: string, permission: string): boolean {
    const permissions = this.getPermissionsForRole(role);
    return permissions.includes(permission);
  }
}
