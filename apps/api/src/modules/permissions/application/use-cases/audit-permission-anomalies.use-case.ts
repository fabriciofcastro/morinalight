import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PrismaService } from "../../../../infra/database/prisma.service";
import type {
  AuditFilters,
  AuditGap,
  AuditReport,
  AuditSummary,
  ExcessivePermission,
  HierarchyInconsistency,
  ObsoletePermission,
  OrphanedPermission,
  PermissionConflict,
  SoDViolation,
} from "../../domain/types/audit-types";

const auditPermissionAnomaliesInputSchema = z.object({
  orgId: z.string().uuid(),
  actorId: z.string().uuid(),
  filters: z
    .object({
      includeOrphaned: z.boolean().optional().default(true),
      includeConflicts: z.boolean().optional().default(true),
      includeExcessive: z.boolean().optional().default(true),
      includeHierarchy: z.boolean().optional().default(true),
      includeAuditGaps: z.boolean().optional().default(true),
      includeObsolete: z.boolean().optional().default(true),
      includeSoD: z.boolean().optional().default(true),
      minSeverity: z.enum(["low", "medium", "high", "critical"]).optional(),
      entityType: z.enum(["user", "position", "sector", "department", "subdepartment"]).optional(),
      entityId: z.string().uuid().optional(),
    })
    .optional()
    .default({}),
});

type Dependencies = {
  prisma: PrismaService;
};

export class AuditPermissionAnomaliesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown): Promise<AuditReport> {
    const input = auditPermissionAnomaliesInputSchema.parse(rawInput);
    const filters = input.filters as AuditFilters;

    const reportId = randomUUID();
    const timestamp = new Date();

    // Executar todas as verificações em paralelo
    const [
      orphanedPermissions,
      conflicts,
      excessivePermissions,
      hierarchyIssues,
      auditGaps,
      obsoletePermissions,
      sodViolations,
    ] = await Promise.all([
      filters.includeOrphaned ? this.findOrphanedPermissions(input.orgId, filters) : [],
      filters.includeConflicts ? this.findPermissionConflicts(input.orgId, filters) : [],
      filters.includeExcessive ? this.findExcessivePermissions(input.orgId, filters) : [],
      filters.includeHierarchy ? this.findHierarchyInconsistencies(input.orgId, filters) : [],
      filters.includeAuditGaps ? this.findAuditGaps(input.orgId, filters) : [],
      filters.includeObsolete ? this.findObsoletePermissions(input.orgId, filters) : [],
      filters.includeSoD ? this.findSoDViolations(input.orgId, filters) : [],
    ]);

    // Calcular métricas
    const summary = await this.calculateSummary(
      input.orgId,
      orphanedPermissions,
      conflicts,
      excessivePermissions,
      hierarchyIssues,
      auditGaps,
      obsoletePermissions,
      sodViolations,
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      orphanedPermissions,
      conflicts,
      excessivePermissions,
      hierarchyIssues,
      auditGaps,
      obsoletePermissions,
      sodViolations,
    );

    return {
      id: reportId,
      orgId: input.orgId,
      timestamp,
      executedBy: input.actorId,
      summary,
      orphanedPermissions,
      conflicts,
      excessivePermissions,
      hierarchyIssues,
      auditGaps,
      obsoletePermissions,
      sodViolations,
      recommendations,
    };
  }

  /**
   * Encontra permissões atribuídas a entidades que não existem mais
   */
  private async findOrphanedPermissions(
    orgId: string,
    filters: AuditFilters,
  ): Promise<OrphanedPermission[]> {
    const orphaned: OrphanedPermission[] = [];

    // Verificar UserPermissions órfãs
    if (!filters.entityType || filters.entityType === "user") {
      const orphanedUserPerms = await this.deps.prisma.userPermission.findMany({
        where: {
          orgId,
          ...(filters.entityId && { userId: filters.entityId }),
          user: null,
        },
        include: {
          permission: true,
        },
      });

      orphaned.push(
        ...orphanedUserPerms.map((perm) => ({
          type: "user" as const,
          permissionId: perm.permissionId,
          entityId: perm.userId,
          reason: "Usuário não existe mais no sistema",
          createdAt: perm.createdAt,
          createdBy: perm.createdBy,
        })),
      );
    }

    // Verificar PositionPermissions órfãs
    if (!filters.entityType || filters.entityType === "position") {
      const orphanedPositionPerms = await this.deps.prisma.positionPermission.findMany({
        where: {
          orgId,
          ...(filters.entityId && { positionId: filters.entityId }),
          position: {
            deletedAt: { not: null },
          },
        },
      });

      orphaned.push(
        ...orphanedPositionPerms.map((perm) => ({
          type: "position" as const,
          permissionId: perm.permissionId,
          entityId: perm.positionId,
          reason: "Cargo foi deletado (soft delete)",
          createdAt: perm.createdAt,
          createdBy: perm.createdBy,
        })),
      );
    }

    // Verificar SectorPermissions órfãs
    if (!filters.entityType || filters.entityType === "sector") {
      const orphanedSectorPerms = await this.deps.prisma.sectorPermission.findMany({
        where: {
          orgId,
          ...(filters.entityId && { sectorId: filters.entityId }),
          sector: {
            deletedAt: { not: null },
          },
        },
      });

      orphaned.push(
        ...orphanedSectorPerms.map((perm) => ({
          type: "sector" as const,
          permissionId: perm.permissionId,
          entityId: perm.sectorId,
          reason: "Setor foi deletado (soft delete)",
          createdAt: perm.createdAt,
          createdBy: perm.createdBy,
        })),
      );
    }

    // Verificar DepartmentPermissions órfãs
    if (!filters.entityType || filters.entityType === "department") {
      const orphanedDeptPerms = await this.deps.prisma.departmentPermission.findMany({
        where: {
          orgId,
          ...(filters.entityId && { departmentId: filters.entityId }),
          department: {
            deletedAt: { not: null },
          },
        },
      });

      orphaned.push(
        ...orphanedDeptPerms.map((perm) => ({
          type: "department" as const,
          permissionId: perm.permissionId,
          entityId: perm.departmentId,
          reason: "Departamento foi deletado (soft delete)",
          createdAt: perm.createdAt,
          createdBy: perm.createdBy,
        })),
      );
    }

    // Verificar SubdepartmentPermissions órfãs
    if (!filters.entityType || filters.entityType === "subdepartment") {
      const orphanedSubdeptPerms = await this.deps.prisma.subdepartmentPermission.findMany({
        where: {
          orgId,
          ...(filters.entityId && { subdepartmentId: filters.entityId }),
          subdepartment: {
            deletedAt: { not: null },
          },
        },
      });

      orphaned.push(
        ...orphanedSubdeptPerms.map((perm) => ({
          type: "subdepartment" as const,
          permissionId: perm.permissionId,
          entityId: perm.subdepartmentId,
          reason: "Subdepartamento foi deletado (soft delete)",
          createdAt: perm.createdAt,
          createdBy: perm.createdBy,
        })),
      );
    }

    return orphaned;
  }

  /**
   * Encontra conflitos de permissões (mesma permissão com granted=true e granted=false)
   */
  private async findPermissionConflicts(
    orgId: string,
    filters: AuditFilters,
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];

    // Buscar todos os usuários da organização
    const users = await this.deps.prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organizationId: orgId,
          },
        },
        ...(filters.entityId && { id: filters.entityId }),
      },
      include: {
        userPermissions: {
          where: { orgId },
          include: { permission: true },
        },
        positionMemberships: {
          where: { orgId },
          include: {
            position: {
              include: {
                permissions: {
                  where: { orgId },
                },
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      // Agrupar permissões por permissionId
      const permissionMap = new Map<
        string,
        { granted: boolean; source: string; sourceId: string }[]
      >();

      // Adicionar permissões customizadas do usuário
      for (const userPerm of user.userPermissions) {
        if (!permissionMap.has(userPerm.permissionId)) {
          permissionMap.set(userPerm.permissionId, []);
        }
        permissionMap.get(userPerm.permissionId)!.push({
          granted: userPerm.granted,
          source: "user",
          sourceId: user.id,
        });
      }

      // Adicionar permissões do cargo
      for (const posMembership of user.positionMemberships) {
        for (const posPerm of posMembership.position.permissions) {
          if (!permissionMap.has(posPerm.permissionId)) {
            permissionMap.set(posPerm.permissionId, []);
          }
          permissionMap.get(posPerm.permissionId)!.push({
            granted: posPerm.granted,
            source: "position",
            sourceId: posMembership.positionId,
          });
        }
      }

      // Verificar conflitos
      for (const [permissionId, sources] of permissionMap.entries()) {
        const hasGrant = sources.some((s) => s.granted === true);
        const hasDeny = sources.some((s) => s.granted === false);

        if (hasGrant && hasDeny) {
          const severity = this.calculateConflictSeverity(sources);

          if (!filters.minSeverity || this.meetsSeverity(severity, filters.minSeverity)) {
            conflicts.push({
              userId: user.id,
              userName: user.displayName || user.email,
              permissionId,
              sources: sources.map((s) => ({
                type: s.source as any,
                entityId: s.sourceId,
                granted: s.granted,
              })),
              severity,
              description: `Usuário tem permissão concedida e negada simultaneamente`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Encontra permissões excessivas ou redundantes
   */
  private async findExcessivePermissions(
    orgId: string,
    filters: AuditFilters,
  ): Promise<ExcessivePermission[]> {
    const excessive: ExcessivePermission[] = [];

    // Buscar permissões customizadas de usuário que já são herdadas do cargo
    const userPerms = await this.deps.prisma.userPermission.findMany({
      where: {
        orgId,
        granted: true,
        ...(filters.entityId && { userId: filters.entityId }),
      },
      include: {
        user: {
          include: {
            positionMemberships: {
              where: { orgId },
              include: {
                position: {
                  include: {
                    permissions: {
                      where: { orgId },
                    },
                  },
                },
              },
            },
          },
        },
        permission: true,
      },
    });

    for (const userPerm of userPerms) {
      // Verificar se a permissão já é herdada do cargo
      const inheritedFromPosition = userPerm.user.positionMemberships.some((pm) =>
        pm.position.permissions.some(
          (pp) => pp.permissionId === userPerm.permissionId && pp.granted,
        ),
      );

      if (inheritedFromPosition) {
        excessive.push({
          entityType: "user",
          entityId: userPerm.userId,
          entityName: userPerm.user.displayName || userPerm.user.email,
          permissionId: userPerm.permissionId,
          permissionCode: userPerm.permission.code,
          reason: "Permissão redundante - já herdada do cargo",
          severity: "low",
        });
      }
    }

    return excessive;
  }

  /**
   * Encontra inconsistências na hierarquia de permissões
   */
  private async findHierarchyInconsistencies(
    orgId: string,
    filters: AuditFilters,
  ): Promise<HierarchyInconsistency[]> {
    const inconsistencies: HierarchyInconsistency[] = [];

    // Verificar setores com permissões que o departamento não tem
    const sectors = await this.deps.prisma.sector.findMany({
      where: {
        orgId,
        deletedAt: null,
        ...(filters.entityId && { id: filters.entityId }),
      },
      include: {
        permissions: {
          where: { orgId, granted: true },
          include: { permission: true },
        },
        department: {
          include: {
            permissions: {
              where: { orgId, granted: true },
            },
          },
        },
      },
    });

    for (const sector of sectors) {
      const deptPermissionIds = new Set(sector.department.permissions.map((p) => p.permissionId));

      for (const sectorPerm of sector.permissions) {
        if (!deptPermissionIds.has(sectorPerm.permissionId)) {
          inconsistencies.push({
            childType: "sector",
            childId: sector.id,
            childName: sector.name,
            parentType: "department",
            parentId: sector.departmentId,
            parentName: sector.department.name,
            permissionId: sectorPerm.permissionId,
            permissionCode: sectorPerm.permission.code,
            issue: "Setor tem permissão que o departamento pai não possui",
          });
        }
      }
    }

    return inconsistencies;
  }

  /**
   * Encontra gaps na auditoria (mudanças sem registro)
   */
  private async findAuditGaps(orgId: string, filters: AuditFilters): Promise<AuditGap[]> {
    const gaps: AuditGap[] = [];

    // Verificar permissões criadas recentemente sem auditoria
    const recentPerms = await this.deps.prisma.userPermission.findMany({
      where: {
        orgId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
        },
        ...(filters.entityId && { userId: filters.entityId }),
      },
    });

    for (const perm of recentPerms) {
      const auditLog = await this.deps.prisma.permissionAuditLog.findFirst({
        where: {
          orgId,
          entityType: "user",
          entityId: perm.userId,
          permissionId: perm.permissionId,
          action: "granted",
        },
      });

      if (!auditLog) {
        gaps.push({
          entityType: "user",
          entityId: perm.userId,
          permissionId: perm.permissionId,
          action: "granted",
          missingFields: ["auditLog"],
          createdAt: perm.createdAt,
        });
      }
    }

    return gaps;
  }

  /**
   * Encontra permissões obsoletas (não utilizadas)
   */
  private async findObsoletePermissions(
    orgId: string,
    filters: AuditFilters,
  ): Promise<ObsoletePermission[]> {
    const obsolete: ObsoletePermission[] = [];

    // Buscar todas as permissões do sistema
    const allPermissions = await this.deps.prisma.permission.findMany();

    for (const permission of allPermissions) {
      // Contar uso da permissão
      const [userCount, positionCount, sectorCount, deptCount] = await Promise.all([
        this.deps.prisma.userPermission.count({
          where: { orgId, permissionId: permission.id },
        }),
        this.deps.prisma.positionPermission.count({
          where: { orgId, permissionId: permission.id },
        }),
        this.deps.prisma.sectorPermission.count({
          where: { orgId, permissionId: permission.id },
        }),
        this.deps.prisma.departmentPermission.count({
          where: { orgId, permissionId: permission.id },
        }),
      ]);

      const totalUsage = userCount + positionCount + sectorCount + deptCount;

      if (totalUsage === 0) {
        // Buscar último uso no audit log
        const lastAudit = await this.deps.prisma.permissionAuditLog.findFirst({
          where: {
            orgId,
            permissionId: permission.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        obsolete.push({
          permissionId: permission.id,
          permissionCode: permission.code,
          permissionName: permission.name,
          lastUsed: lastAudit?.createdAt || null,
          usageCount: 0,
          reason: "Permissão não está sendo utilizada em nenhuma entidade",
        });
      }
    }

    return obsolete;
  }

  /**
   * Encontra violações de Segregação de Funções (SoD)
   */
  private async findSoDViolations(orgId: string, filters: AuditFilters): Promise<SoDViolation[]> {
    const violations: SoDViolation[] = [];

    // Definir pares de permissões conflitantes (exemplo)
    const conflictingPairs = [
      { create: "products:create", approve: "products:approve" },
      { create: "fichas_custo:create", approve: "fichas_custo:approve" },
      { create: "users:create", approve: "users:approve" },
    ];

    // Buscar usuários com permissões conflitantes
    const users = await this.deps.prisma.user.findMany({
      where: {
        memberships: {
          some: { organizationId: orgId },
        },
        ...(filters.entityId && { id: filters.entityId }),
      },
      include: {
        userPermissions: {
          where: { orgId, granted: true },
          include: { permission: true },
        },
      },
    });

    for (const user of users) {
      const userPermCodes = new Set(user.userPermissions.map((p) => p.permission.code));

      for (const pair of conflictingPairs) {
        if (userPermCodes.has(pair.create) && userPermCodes.has(pair.approve)) {
          const createPerm = user.userPermissions.find((p) => p.permission.code === pair.create);
          const approvePerm = user.userPermissions.find((p) => p.permission.code === pair.approve);

          if (createPerm && approvePerm) {
            violations.push({
              userId: user.id,
              userName: user.displayName || user.email,
              conflictingPermissions: [
                {
                  permissionId: createPerm.permissionId,
                  permissionCode: createPerm.permission.code,
                  permissionName: createPerm.permission.name,
                },
                {
                  permissionId: approvePerm.permissionId,
                  permissionCode: approvePerm.permission.code,
                  permissionName: approvePerm.permission.name,
                },
              ],
              severity: "high",
              description: `Usuário pode criar e aprovar a mesma entidade`,
              riskLevel: "Violação de segregação de funções",
            });
          }
        }
      }
    }

    return violations;
  }

  /**
   * Calcula métricas do relatório
   */
  private async calculateSummary(
    orgId: string,
    orphaned: OrphanedPermission[],
    conflicts: PermissionConflict[],
    excessive: ExcessivePermission[],
    hierarchy: HierarchyInconsistency[],
    gaps: AuditGap[],
    obsolete: ObsoletePermission[],
    sod: SoDViolation[],
  ): Promise<AuditSummary> {
    const [totalPermissions, totalUsers, totalPositions, totalSectors, totalDepartments] =
      await Promise.all([
        this.deps.prisma.permission.count(),
        this.deps.prisma.user.count({
          where: {
            memberships: {
              some: { organizationId: orgId },
            },
          },
        }),
        this.deps.prisma.position.count({ where: { orgId, deletedAt: null } }),
        this.deps.prisma.sector.count({ where: { orgId, deletedAt: null } }),
        this.deps.prisma.department.count({ where: { orgId, deletedAt: null } }),
      ]);

    const anomaliesFound =
      orphaned.length +
      conflicts.length +
      excessive.length +
      hierarchy.length +
      gaps.length +
      obsolete.length +
      sod.length;

    const criticalIssues =
      conflicts.filter((c) => c.severity === "critical").length +
      sod.filter((s) => s.severity === "critical").length;

    const highSeverityIssues =
      conflicts.filter((c) => c.severity === "high").length +
      sod.filter((s) => s.severity === "high").length;

    const mediumSeverityIssues =
      conflicts.filter((c) => c.severity === "medium").length +
      excessive.filter((e) => e.severity === "medium").length +
      sod.filter((s) => s.severity === "medium").length;

    const lowSeverityIssues =
      conflicts.filter((c) => c.severity === "low").length +
      excessive.filter((e) => e.severity === "low").length +
      sod.filter((s) => s.severity === "low").length;

    // Calcular score de conformidade (0-100)
    const maxPossibleIssues = totalUsers * 10; // Estimativa
    const conformityScore = Math.max(
      0,
      Math.min(100, 100 - (anomaliesFound / maxPossibleIssues) * 100),
    );

    return {
      totalPermissions,
      totalUsers,
      totalPositions,
      totalSectors,
      totalDepartments,
      anomaliesFound,
      conformityScore: Math.round(conformityScore),
      criticalIssues,
      highSeverityIssues,
      mediumSeverityIssues,
      lowSeverityIssues,
    };
  }

  /**
   * Gera recomendações baseadas nas anomalias encontradas
   */
  private generateRecommendations(
    orphaned: OrphanedPermission[],
    conflicts: PermissionConflict[],
    excessive: ExcessivePermission[],
    hierarchy: HierarchyInconsistency[],
    gaps: AuditGap[],
    obsolete: ObsoletePermission[],
    sod: SoDViolation[],
  ): string[] {
    const recommendations: string[] = [];

    if (orphaned.length > 0) {
      recommendations.push(
        `Remover ${orphaned.length} permissões órfãs para limpar o banco de dados`,
      );
    }

    if (conflicts.length > 0) {
      recommendations.push(
        `Resolver ${conflicts.length} conflitos de permissões para garantir consistência`,
      );
    }

    if (excessive.length > 0) {
      recommendations.push(
        `Remover ${excessive.length} permissões excessivas para seguir princípio do menor privilégio`,
      );
    }

    if (hierarchy.length > 0) {
      recommendations.push(
        `Corrigir ${hierarchy.length} inconsistências hierárquicas para manter integridade`,
      );
    }

    if (gaps.length > 0) {
      recommendations.push(
        `Preencher ${gaps.length} gaps de auditoria para rastreabilidade completa`,
      );
    }

    if (obsolete.length > 0) {
      recommendations.push(
        `Arquivar ${obsolete.length} permissões obsoletas para simplificar o sistema`,
      );
    }

    if (sod.length > 0) {
      recommendations.push(
        `CRÍTICO: Resolver ${sod.length} violações de segregação de funções imediatamente`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Sistema de permissões está em conformidade! Nenhuma anomalia detectada.",
      );
    }

    return recommendations;
  }

  /**
   * Calcula severidade do conflito
   */
  private calculateConflictSeverity(
    sources: { granted: boolean; source: string }[],
  ): "low" | "medium" | "high" | "critical" {
    const hasUserLevel = sources.some((s) => s.source === "user");
    const hasMultipleSources = sources.length > 2;

    if (hasUserLevel && hasMultipleSources) {
      return "critical";
    }
    if (hasUserLevel) {
      return "high";
    }
    if (hasMultipleSources) {
      return "medium";
    }
    return "low";
  }

  /**
   * Verifica se a severidade atende ao filtro mínimo
   */
  private meetsSeverity(
    severity: "low" | "medium" | "high" | "critical",
    minSeverity: "low" | "medium" | "high" | "critical",
  ): boolean {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity] >= levels[minSeverity];
  }
}
