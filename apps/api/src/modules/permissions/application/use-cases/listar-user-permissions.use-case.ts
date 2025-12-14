import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import {
  listarUserPermissionsInputSchema,
  userPermissionViewSchema,
} from "../schemas/user-permission.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  positionRepository?: PositionRepository;
  organizationRepository: OrganizationRepository;
};

export class ListarUserPermissionsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarUserPermissionsInputSchema.parse(rawInput);

    // Buscar membership do usuário
    const membership = await this.deps.organizationRepository.encontrarMembership?.(
      input.orgId,
      input.userId || "",
    );

    if (!membership) {
      return {
        permissions: [],
        role: null,
        customPermissions: [],
      };
    }

    // Mapear role para permissões base
    const rolePermissions = this.getPermissionsForRole(membership.role);

    // Buscar permissões customizadas do usuário
    // TODO: Implementar busca real de UserPermission no banco
    const customPermissions: Array<{ permissionId: string; granted: boolean }> = [];

    // Buscar cargos do usuário e suas permissões
    const positionPermissionIds = new Set<string>();
    if (this.deps.positionMembershipRepository && this.deps.positionPermissionRepository) {
      const positionMemberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId || "",
      );

      if (positionMemberships.length > 0) {
        const positionIds = positionMemberships.map((m) => m.positionId);
        const positionPermissions = await this.deps.positionPermissionRepository.listarPorPositions(
          input.orgId,
          positionIds,
        );

        // Adicionar permissões dos cargos (apenas as concedidas)
        // permissionId pode ser chave (resource:action) ou ID da permissão
        for (const pp of positionPermissions) {
          // Buscar permissão por ID primeiro, se falhar, usar como chave
          let permissionKey = pp.permissionId;
          try {
            const permission = await this.deps.permissionRepository.encontrarPorId(pp.permissionId);
            if (permission) {
              permissionKey = permission.permissionKey;
            }
          } catch {
            // Se não encontrar por ID, assume que permissionId é a chave
            permissionKey = pp.permissionId;
          }

          if (pp.granted) {
            positionPermissionIds.add(permissionKey);
          } else {
            // Se negado explicitamente, remove da lista (sobrescreve role)
            positionPermissionIds.delete(permissionKey);
          }
        }
      }
    }

    // Buscar departamentos do usuário e suas permissões
    const departmentPermissionIds = new Set<string>();
    if (this.deps.departmentMembershipRepository && this.deps.departmentPermissionRepository) {
      const departmentMemberships = await this.deps.departmentMembershipRepository.listarPorUser(
        input.orgId,
        input.userId || "",
      );

      if (departmentMemberships.length > 0) {
        const departmentIds = departmentMemberships.map((m) => m.departmentId);
        const departmentPermissions =
          await this.deps.departmentPermissionRepository.listarPorDepartments(
            input.orgId,
            departmentIds,
          );

        // Adicionar permissões dos departamentos
        for (const dp of departmentPermissions) {
          let permissionKey = dp.permissionId;
          try {
            const permission = await this.deps.permissionRepository.encontrarPorId(dp.permissionId);
            if (permission) {
              permissionKey = permission.permissionKey;
            }
          } catch {
            permissionKey = dp.permissionId;
          }

          if (dp.granted) {
            departmentPermissionIds.add(permissionKey);
          } else {
            departmentPermissionIds.delete(permissionKey);
          }
        }
      }
    }

    // Buscar setores do usuário e suas permissões
    // Buscar setores através dos cargos do usuário (cargos pertencem a setores)
    const sectorPermissionIds = new Set<string>();
    if (
      this.deps.positionMembershipRepository &&
      this.deps.sectorPermissionRepository &&
      this.deps.positionRepository
    ) {
      const positionMemberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId || "",
      );

      if (positionMemberships.length > 0) {
        const positionIds = positionMemberships.map((m) => m.positionId);
        // Buscar cargos para obter os setores
        const positions = await Promise.all(
          positionIds.map((positionId) =>
            this.deps.positionRepository?.encontrarPorId(input.orgId, positionId),
          ),
        );

        const sectorIds = positions
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .map((p) => p.dados.sectorId)
          .filter((id): id is string => id !== undefined);

        if (sectorIds.length > 0) {
          const sectorPermissions = await this.deps.sectorPermissionRepository.listarPorSectors(
            input.orgId,
            sectorIds,
          );

          // Adicionar permissões dos setores
          for (const sp of sectorPermissions) {
            let permissionKey = sp.permissionId;
            try {
              const permission = await this.deps.permissionRepository.encontrarPorId(
                sp.permissionId,
              );
              if (permission) {
                permissionKey = permission.permissionKey;
              }
            } catch {
              permissionKey = sp.permissionId;
            }

            if (sp.granted) {
              sectorPermissionIds.add(permissionKey);
            } else {
              sectorPermissionIds.delete(permissionKey);
            }
          }
        }
      }
    }

    // Combinar permissões do role, dos departamentos, setores, cargos e customizadas
    // Ordem de precedência: role < departamento < setor < cargo < customizada
    const allPermissionIds = new Set<string>();
    rolePermissions.forEach((p) => {
      allPermissionIds.add(p);
    });

    // Permissões dos departamentos sobrescrevem role
    departmentPermissionIds.forEach((p) => {
      allPermissionIds.add(p);
    });

    // Permissões dos setores sobrescrevem departamento e role
    sectorPermissionIds.forEach((p) => {
      allPermissionIds.add(p);
    });

    // Permissões dos cargos sobrescrevem setor, departamento e role
    positionPermissionIds.forEach((p) => {
      allPermissionIds.add(p);
    });

    // Permissões customizadas sobrescrevem tudo
    customPermissions.forEach((p) => {
      if (p.granted) {
        allPermissionIds.add(p.permissionId);
      } else {
        allPermissionIds.delete(p.permissionId);
      }
    });

    // Buscar detalhes das permissões
    const permissions = await this.deps.permissionRepository.encontrarPorIds(
      Array.from(allPermissionIds),
    );

    const views = permissions.map((permission) =>
      userPermissionViewSchema.parse({
        userId: membership.userId,
        orgId: membership.organizationId,
        permissionId: permission.permissionId,
        granted: true,
        permissionKey: permission.permissionKey,
        permissionName: permission.dados.name,
      }),
    );

    return {
      permissions: views,
      role: membership.role,
      customPermissions,
    };
  }

  private getPermissionsForRole(role: string): string[] {
    // Mapear roles para permissões base
    const rolePermissionsMap: Record<string, string[]> = {
      owner: [
        // Todas as permissões
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
}
