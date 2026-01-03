import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import type { UserPermissionRepository } from "../../domain/repositories/user-permission-repository";
import type { UserRepository } from "../../../users/repositories/user.repository";
import type { PermissionCacheService } from "../../domain/services/permission-cache.service";
import type { PermissionInheritanceService } from "../../domain/services/permission-inheritance.service";
import {
  resolverPermissoesEfetivasInputSchema,
  resolverPermissoesEfetivasResultadoSchema,
} from "../schemas/effective-permissions.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  positionRepository?: PositionRepository;
  permissionCacheService?: PermissionCacheService;
  permissionInheritanceService?: PermissionInheritanceService;
  userRepository?: UserRepository;
};

export class ResolverPermissoesEfetivasUseCase {
  constructor(private readonly deps: Dependencies) { }

  async execute(rawInput: unknown) {
    const input = resolverPermissoesEfetivasInputSchema.parse(rawInput);

    // Tentar obter do cache
    if (this.deps.permissionCacheService) {
      const cached = await this.deps.permissionCacheService.getEffectivePermissions(
        input.orgId,
        input.userId,
      );
      if (cached) {
        return resolverPermissoesEfetivasResultadoSchema.parse({
          userId: cached.userId,
          orgId: cached.orgId,
          role: null, // Não cacheamos role por enquanto
          effective: cached.permissions,
          denied: cached.denied,
          breakdown: {
            role: [],
            departments: [],
            sectors: [],
            positions: [],
            custom: [],
          },
        });
      }
    }

    const membership = await this.deps.organizationRepository.encontrarMembership?.(
      input.orgId,
      input.userId,
    );

    const user = this.deps.userRepository ? await this.deps.userRepository.findById(input.userId) : null;

    if (!membership) {
      return resolverPermissoesEfetivasResultadoSchema.parse({
        userId: input.userId,
        orgId: input.orgId,
        role: null,
        effective: [],
        denied: [],
        breakdown: {
          role: [],
          departments: [],
          sectors: [],
          positions: [],
          custom: [],
        },
      });
    }

    const permissionKeyCache = new Map<string, string>();

    const permissionKeyFromIdOrKey = async (permissionIdOrKey: string) => {
      if (permissionKeyCache.has(permissionIdOrKey)) {
        const cached = permissionKeyCache.get(permissionIdOrKey);
        if (cached !== undefined) return cached;
      }

      try {
        const permission = await this.deps.permissionRepository.encontrarPorId(permissionIdOrKey);
        if (permission) {
          permissionKeyCache.set(permissionIdOrKey, permission.permissionKey);
          return permission.permissionKey;
        }
      } catch {
        // ignore
      }

      permissionKeyCache.set(permissionIdOrKey, permissionIdOrKey);
      return permissionIdOrKey;
    };

    // Base: role do membership (legacy)
    const rolePermissionKeys = this.getPermissionsForRole(membership.role);

    const departmentGrants: Array<{
      permissionKey: string;
      granted: boolean;
      sourceEntityId?: string;
    }> = [];
    const sectorGrants: Array<{
      permissionKey: string;
      granted: boolean;
      sourceEntityId?: string;
    }> = [];
    const positionGrants: Array<{
      permissionKey: string;
      granted: boolean;
      sourceEntityId?: string;
    }> = [];

    const customGrants: Array<{
      permissionKey: string;
      granted: boolean;
      sourceEntityId?: string;
    }> = [];

    if (this.deps.userPermissionRepository) {
      const custom = await this.deps.userPermissionRepository.listarPorUser(
        input.orgId,
        input.userId,
      );
      for (const up of custom) {
        const permissionKey = await permissionKeyFromIdOrKey(up.permissionId);
        customGrants.push({
          permissionKey,
          granted: up.granted,
          sourceEntityId: input.userId,
        });
      }
    }

    if (this.deps.departmentMembershipRepository && this.deps.departmentPermissionRepository) {
      const memberships = await this.deps.departmentMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );
      if (memberships.length > 0) {
        const departmentIds = memberships.map((m) => m.departmentId);
        const perms = await this.deps.departmentPermissionRepository.listarPorDepartments(
          input.orgId,
          departmentIds,
        );
        for (const dp of perms) {
          const permissionKey = await permissionKeyFromIdOrKey(dp.permissionId);
          departmentGrants.push({
            permissionKey,
            granted: dp.granted,
            sourceEntityId: dp.departmentId,
          });
        }

        // Buscar permissões herdadas dos departamentos pais
        if (this.deps.permissionInheritanceService) {
          for (const membership of memberships) {
            const inherited = await this.deps.permissionInheritanceService.resolveDepartmentInheritedPermissions(
              input.orgId,
              membership.departmentId,
            );
            for (const perm of inherited) {
              // Só adicionar se não houver override direto
              const existingIndex = departmentGrants.findIndex(
                (g) => g.permissionKey === perm.permissionKey && g.sourceEntityId === membership.departmentId,
              );
              if (existingIndex === -1) {
                departmentGrants.push({
                  permissionKey: perm.permissionKey,
                  granted: perm.granted,
                  sourceEntityId: perm.inheritedFrom.entityId,
                });
              }
            }
          }
        }
      }
    }

    if (
      this.deps.positionMembershipRepository &&
      this.deps.sectorPermissionRepository &&
      this.deps.positionRepository
    ) {
      const memberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );
      if (memberships.length > 0) {
        const positionIds = memberships.map((m) => m.positionId);
        const positions = await Promise.all(
          positionIds.map((positionId) =>
            this.deps.positionRepository!.encontrarPorId(input.orgId, positionId),
          ),
        );
        const validPositions = positions.filter(
          (p): p is NonNullable<typeof p> => p !== null && p !== undefined,
        );
        const sectorIds = validPositions.map((p) => p.dados.sectorId).filter((id): id is string => id !== undefined);
        if (sectorIds.length > 0) {
          const perms = await this.deps.sectorPermissionRepository.listarPorSectors(
            input.orgId,
            sectorIds,
          );
          for (const sp of perms) {
            const permissionKey = await permissionKeyFromIdOrKey(sp.permissionId);
            sectorGrants.push({
              permissionKey,
              granted: sp.granted,
              sourceEntityId: sp.sectorId,
            });
          }

          // Buscar permissões herdadas dos setores pais e departamentos
          if (this.deps.permissionInheritanceService) {
            for (const sectorId of sectorIds) {
              const inherited = await this.deps.permissionInheritanceService.resolveSectorInheritedPermissions(
                input.orgId,
                sectorId,
              );
              for (const perm of inherited) {
                // Só adicionar se não houver override direto
                const existingIndex = sectorGrants.findIndex(
                  (g) => g.permissionKey === perm.permissionKey && g.sourceEntityId === sectorId,
                );
                if (existingIndex === -1) {
                  sectorGrants.push({
                    permissionKey: perm.permissionKey,
                    granted: perm.granted,
                    sourceEntityId: perm.inheritedFrom.entityId,
                  });
                }
              }
            }
          }
        }
      }
    }

    if (this.deps.positionMembershipRepository && this.deps.positionPermissionRepository) {
      const memberships = await this.deps.positionMembershipRepository.listarPorUser(
        input.orgId,
        input.userId,
      );
      if (memberships.length > 0) {
        const positionIds = memberships.map((m) => m.positionId);
        const perms = await this.deps.positionPermissionRepository.listarPorPositions(
          input.orgId,
          positionIds,
        );
        for (const pp of perms) {
          const permissionKey = await permissionKeyFromIdOrKey(pp.permissionId);
          positionGrants.push({
            permissionKey,
            granted: pp.granted,
            sourceEntityId: pp.positionId,
          });
        }

        // Buscar permissões herdadas dos setores pais (via cargo)
        if (this.deps.permissionInheritanceService) {
          for (const membership of memberships) {
            const inherited = await this.deps.permissionInheritanceService.resolvePositionInheritedPermissions(
              input.orgId,
              membership.positionId,
            );
            for (const perm of inherited) {
              // Só adicionar se não houver override direto
              const existingIndex = positionGrants.findIndex(
                (g) => g.permissionKey === perm.permissionKey && g.sourceEntityId === membership.positionId,
              );
              if (existingIndex === -1) {
                positionGrants.push({
                  permissionKey: perm.permissionKey,
                  granted: perm.granted,
                  sourceEntityId: perm.inheritedFrom.entityId,
                });
              }
            }
          }
        }
      }
    }

    // Resolução final (precedência): role < department < sector < position < custom
    // Regra: deny sempre vence (mesmo se vier grant depois em nível inferior, fica negado)
    const allow = new Set<string>();
    const deny = new Set<string>();

    for (const k of rolePermissionKeys) allow.add(k);

    const applyGrants = (grants: Array<{ permissionKey: string; granted: boolean }>) => {
      for (const g of grants) {
        if (!g.permissionKey) continue;
        if (g.granted) {
          if (!deny.has(g.permissionKey)) allow.add(g.permissionKey);
        } else {
          deny.add(g.permissionKey);
          allow.delete(g.permissionKey);
        }
      }
    };

    applyGrants(departmentGrants);
    applyGrants(sectorGrants);
    applyGrants(positionGrants);
    applyGrants(customGrants);

    const effective = Array.from(allow)
      .sort()
      .map((permissionKey) => ({
        permissionKey,
        granted: true,
      }));

    const denied = Array.from(deny).sort();

    const result = resolverPermissoesEfetivasResultadoSchema.parse({
      userId: membership.userId,
      orgId: membership.organizationId,
      role: membership.role,
      effective,
      denied,
      breakdown: {
        role: rolePermissionKeys.slice().sort(),
        departments: departmentGrants.map((g) => ({
          permissionKey: g.permissionKey,
          granted: g.granted,
          source: "department",
          sourceEntityId: g.sourceEntityId,
        })),
        sectors: sectorGrants.map((g) => ({
          permissionKey: g.permissionKey,
          granted: g.granted,
          source: "sector",
          sourceEntityId: g.sourceEntityId,
        })),
        positions: positionGrants.map((g) => ({
          permissionKey: g.permissionKey,
          granted: g.granted,
          source: "position",
          sourceEntityId: g.sourceEntityId,
        })),
        custom: customGrants.map((g) => ({
          permissionKey: g.permissionKey,
          granted: g.granted,
          source: "custom",
          sourceEntityId: g.sourceEntityId,
        })),
      },
      context: {
        departmentId: departmentGrants[0]?.sourceEntityId || user?.branchId || undefined,
        sectorId: sectorGrants[0]?.sourceEntityId || undefined,
        positionId: user?.positionId || positionGrants[0]?.sourceEntityId || undefined,
        attributes: {
          admissionDate: user?.admissionDate,
          status: user?.status,
          branchId: user?.branchId,
          cpf: user?.cpf,
          lastLoginAt: user?.lastLoginAt,
        },
      },
    });

    // Armazenar no cache
    if (this.deps.permissionCacheService) {
      try {
        await this.deps.permissionCacheService.setEffectivePermissions(
          input.orgId,
          input.userId,
          result.effective,
          result.denied,
        );
      } catch (error) {
        // Não falhar a resolução se o cache falhar
        console.error("Erro ao armazenar permissões efetivas no cache:", error);
      }
    }

    return result;
  }

  private getPermissionsForRole(role: string): string[] {
    // Mesmo mapa legacy já usado em ListarUserPermissions/VerificarPermission.
    const map: Record<string, string[]> = {
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
        "commissions:view",
        "suppliers:view",
        "sales:view",
        "reports:view",
        "settings:view",
      ],
      member: [
        "dashboard:view",
        "products:view",
        "catalog:view",
        "clients:view",
        "representatives:view",
        "commissions:view",
        "suppliers:view",
        "sales:view",
      ],
      viewer: ["dashboard:view", "products:view", "clients:view"],
    };

    return map[role] ?? [];
  }
}
