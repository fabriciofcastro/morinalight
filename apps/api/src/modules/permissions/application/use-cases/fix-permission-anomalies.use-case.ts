import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PrismaService } from "../../../../infra/database/prisma.service";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import type {
  AuditGap,
  ExcessivePermission,
  FixOptions,
  FixResult,
  HierarchyInconsistency,
  ObsoletePermission,
  OrphanedPermission,
  PermissionConflict,
} from "../../domain/types/audit-types";

const fixPermissionAnomaliesInputSchema = z.object({
  orgId: z.string().uuid(),
  actorId: z.string().uuid(),
  options: z.object({
    removeOrphaned: z.boolean().optional().default(false),
    resolveConflicts: z.boolean().optional().default(false),
    removeExcessive: z.boolean().optional().default(false),
    fixHierarchy: z.boolean().optional().default(false),
    backfillAudit: z.boolean().optional().default(false),
    archiveObsolete: z.boolean().optional().default(false),
    dryRun: z.boolean().optional().default(true),
  }),
  anomalies: z.object({
    orphaned: z.array(z.any()).optional().default([]),
    conflicts: z.array(z.any()).optional().default([]),
    excessive: z.array(z.any()).optional().default([]),
    hierarchy: z.array(z.any()).optional().default([]),
    gaps: z.array(z.any()).optional().default([]),
    obsolete: z.array(z.any()).optional().default([]),
  }),
});

type Dependencies = {
  prisma: PrismaService;
  auditLogRepository: PermissionAuditLogRepository;
};

export class FixPermissionAnomaliesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown): Promise<FixResult> {
    const input = fixPermissionAnomaliesInputSchema.parse(rawInput);
    const options = input.options as FixOptions;

    const result: FixResult = {
      success: true,
      itemsFixed: 0,
      errors: [],
      warnings: [],
      changes: [],
    };

    try {
      // Remover permissões órfãs
      if (options.removeOrphaned && input.anomalies.orphaned.length > 0) {
        const orphanedResult = await this.removeOrphanedPermissions(
          input.orgId,
          input.actorId,
          input.anomalies.orphaned as OrphanedPermission[],
          options.dryRun || false,
        );
        result.itemsFixed += orphanedResult.itemsFixed;
        result.changes.push(...orphanedResult.changes);
        result.errors.push(...orphanedResult.errors);
      }

      // Resolver conflitos
      if (options.resolveConflicts && input.anomalies.conflicts.length > 0) {
        const conflictsResult = await this.resolvePermissionConflicts(
          input.orgId,
          input.actorId,
          input.anomalies.conflicts as PermissionConflict[],
          options.dryRun || false,
        );
        result.itemsFixed += conflictsResult.itemsFixed;
        result.changes.push(...conflictsResult.changes);
        result.errors.push(...conflictsResult.errors);
      }

      // Remover permissões excessivas
      if (options.removeExcessive && input.anomalies.excessive.length > 0) {
        const excessiveResult = await this.removeExcessivePermissions(
          input.orgId,
          input.actorId,
          input.anomalies.excessive as ExcessivePermission[],
          options.dryRun || false,
        );
        result.itemsFixed += excessiveResult.itemsFixed;
        result.changes.push(...excessiveResult.changes);
        result.errors.push(...excessiveResult.errors);
      }

      // Preencher gaps de auditoria
      if (options.backfillAudit && input.anomalies.gaps.length > 0) {
        const gapsResult = await this.backfillAuditLogs(
          input.orgId,
          input.actorId,
          input.anomalies.gaps as AuditGap[],
          options.dryRun || false,
        );
        result.itemsFixed += gapsResult.itemsFixed;
        result.changes.push(...gapsResult.changes);
        result.errors.push(...gapsResult.errors);
      }

      if (options.dryRun) {
        result.warnings.push("Modo dry-run ativado - nenhuma mudança foi aplicada");
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : "Erro desconhecido");
    }

    return result;
  }

  /**
   * Remove permissões órfãs
   */
  private async removeOrphanedPermissions(
    orgId: string,
    actorId: string,
    orphaned: OrphanedPermission[],
    dryRun: boolean,
  ): Promise<Partial<FixResult>> {
    const result: Partial<FixResult> = {
      itemsFixed: 0,
      errors: [],
      changes: [],
    };

    for (const item of orphaned) {
      try {
        if (!dryRun) {
          // Deletar a permissão órfã
          switch (item.type) {
            case "user":
              await this.deps.prisma.userPermission.deleteMany({
                where: {
                  orgId,
                  userId: item.entityId,
                  permissionId: item.permissionId,
                },
              });
              break;
            case "position":
              await this.deps.prisma.positionPermission.deleteMany({
                where: {
                  orgId,
                  positionId: item.entityId,
                  permissionId: item.permissionId,
                },
              });
              break;
            case "sector":
              await this.deps.prisma.sectorPermission.deleteMany({
                where: {
                  orgId,
                  sectorId: item.entityId,
                  permissionId: item.permissionId,
                },
              });
              break;
            case "department":
              await this.deps.prisma.departmentPermission.deleteMany({
                where: {
                  orgId,
                  departmentId: item.entityId,
                  permissionId: item.permissionId,
                },
              });
              break;
            case "subdepartment":
              await this.deps.prisma.subdepartmentPermission.deleteMany({
                where: {
                  orgId,
                  subdepartmentId: item.entityId,
                  permissionId: item.permissionId,
                },
              });
              break;
          }

          // Registrar na auditoria
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: item.type,
            entityId: item.entityId,
            permissionId: item.permissionId,
            action: "removed",
            granted: null,
            previousValue: true,
            actorId,
            reason: `Removido automaticamente: ${item.reason}`,
            metadata: { automated: true, fixType: "orphaned" },
            createdAt: new Date(),
          });
        }

        result.changes!.push({
          type: "orphaned_removed",
          entityId: item.entityId,
          permissionId: item.permissionId,
          action: "removed",
          timestamp: new Date(),
        });

        result.itemsFixed!++;
      } catch (error) {
        result.errors!.push(
          `Erro ao remover permissão órfã ${item.permissionId} de ${item.entityId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    }

    return result;
  }

  /**
   * Resolve conflitos de permissões (prioriza deny sobre grant)
   */
  private async resolvePermissionConflicts(
    orgId: string,
    actorId: string,
    conflicts: PermissionConflict[],
    dryRun: boolean,
  ): Promise<Partial<FixResult>> {
    const result: Partial<FixResult> = {
      itemsFixed: 0,
      errors: [],
      changes: [],
    };

    for (const conflict of conflicts) {
      try {
        // Estratégia: Remover permissões customizadas de usuário que conflitam
        // e deixar apenas as permissões herdadas do cargo
        const userSource = conflict.sources.find((s) => s.type === "user");

        if (userSource && !dryRun) {
          await this.deps.prisma.userPermission.deleteMany({
            where: {
              orgId,
              userId: conflict.userId,
              permissionId: conflict.permissionId,
            },
          });

          // Registrar na auditoria
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: "user",
            entityId: conflict.userId,
            permissionId: conflict.permissionId,
            action: "removed",
            granted: null,
            previousValue: userSource.granted,
            actorId,
            reason: `Conflito resolvido automaticamente - removida permissão customizada`,
            metadata: { automated: true, fixType: "conflict", conflict },
            createdAt: new Date(),
          });
        }

        result.changes!.push({
          type: "conflict_resolved",
          entityId: conflict.userId,
          permissionId: conflict.permissionId,
          action: "removed_user_override",
          timestamp: new Date(),
        });

        result.itemsFixed!++;
      } catch (error) {
        result.errors!.push(
          `Erro ao resolver conflito para usuário ${conflict.userId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    }

    return result;
  }

  /**
   * Remove permissões excessivas (redundantes)
   */
  private async removeExcessivePermissions(
    orgId: string,
    actorId: string,
    excessive: ExcessivePermission[],
    dryRun: boolean,
  ): Promise<Partial<FixResult>> {
    const result: Partial<FixResult> = {
      itemsFixed: 0,
      errors: [],
      changes: [],
    };

    for (const item of excessive) {
      try {
        if (!dryRun && item.entityType === "user") {
          await this.deps.prisma.userPermission.deleteMany({
            where: {
              orgId,
              userId: item.entityId,
              permissionId: item.permissionId,
            },
          });

          // Registrar na auditoria
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: "user",
            entityId: item.entityId,
            permissionId: item.permissionId,
            action: "removed",
            granted: null,
            previousValue: true,
            actorId,
            reason: `Removido automaticamente: ${item.reason}`,
            metadata: { automated: true, fixType: "excessive" },
            createdAt: new Date(),
          });
        }

        result.changes!.push({
          type: "excessive_removed",
          entityId: item.entityId,
          permissionId: item.permissionId,
          action: "removed",
          timestamp: new Date(),
        });

        result.itemsFixed!++;
      } catch (error) {
        result.errors!.push(
          `Erro ao remover permissão excessiva ${item.permissionId} de ${item.entityId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    }

    return result;
  }

  /**
   * Preenche gaps de auditoria
   */
  private async backfillAuditLogs(
    orgId: string,
    actorId: string,
    gaps: AuditGap[],
    dryRun: boolean,
  ): Promise<Partial<FixResult>> {
    const result: Partial<FixResult> = {
      itemsFixed: 0,
      errors: [],
      changes: [],
    };

    for (const gap of gaps) {
      try {
        if (!dryRun) {
          // Criar registro de auditoria retroativo
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: gap.entityType,
            entityId: gap.entityId,
            permissionId: gap.permissionId,
            action: gap.action,
            granted: gap.action === "granted" ? true : false,
            previousValue: null,
            actorId: "system", // Sistema pois não sabemos quem fez
            reason: `Auditoria retroativa - registro criado automaticamente`,
            metadata: {
              automated: true,
              fixType: "audit_gap",
              originalDate: gap.createdAt,
            },
            createdAt: new Date(),
          });
        }

        result.changes!.push({
          type: "audit_gap_filled",
          entityId: gap.entityId,
          permissionId: gap.permissionId,
          action: "audit_log_created",
          timestamp: new Date(),
        });

        result.itemsFixed!++;
      } catch (error) {
        result.errors!.push(
          `Erro ao preencher gap de auditoria para ${gap.entityId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        );
      }
    }

    return result;
  }
}
