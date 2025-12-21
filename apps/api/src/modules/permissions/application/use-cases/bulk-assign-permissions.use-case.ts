/**
 * Use Case: Atribuir/Remover múltiplas permissões em bulk
 */

import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { UserPermissionRepository } from "../../domain/repositories/user-permission-repository";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";

const bulkAssignPermissionsInputSchema = z.object({
  orgId: z.string().uuid(),
  entityType: z.enum(["department", "sector", "position", "user"]),
  entityId: z.string().uuid(),
  permissionIds: z.array(z.string()).min(1),
  granted: z.boolean().default(true),
  reason: z.string().optional(),
});

type Dependencies = {
  permissionRepository: PermissionRepository;
  departmentRepository?: DepartmentRepository;
  sectorRepository?: SectorRepository;
  positionRepository?: PositionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  actorId: string;
  eventBus?: DomainEventBus;
};

export type BulkPermissionResult = {
  permissionId: string;
  success: boolean;
  error?: string;
};

export type BulkAssignPermissionsResult = {
  total: number;
  success: number;
  failed: number;
  results: BulkPermissionResult[];
};

export class BulkAssignPermissionsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown): Promise<BulkAssignPermissionsResult> {
    const input = bulkAssignPermissionsInputSchema.parse(rawInput);

    // Validar que a entidade existe
    await this.validateEntity(input.entityType, input.entityId, input.orgId);

    const results: BulkPermissionResult[] = [];

    for (const permissionId of input.permissionIds) {
      try {
        // Resolver permissionId (pode ser ID ou chave resource:action)
        let resolvedPermissionId = permissionId;
        let permission = await this.deps.permissionRepository.encontrarPorId(permissionId);

        if (!permission) {
          const [resource, action] = permissionId.split(":");
          if (resource && action) {
            permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);
            if (permission) {
              resolvedPermissionId = permission.permissionId;
            }
          }
        } else {
          resolvedPermissionId = permission.permissionId;
        }

        if (!permission) {
          results.push({
            permissionId,
            success: false,
            error: "Permissão não encontrada",
          });
          continue;
        }

        // Atribuir/remover permissão baseado no entityType
        if (input.granted) {
          await this.grantPermission(
            input.entityType,
            input.entityId,
            input.orgId,
            resolvedPermissionId,
            input.reason,
          );
        } else {
          await this.revokePermission(
            input.entityType,
            input.entityId,
            input.orgId,
            resolvedPermissionId,
            input.reason,
          );
        }

        results.push({
          permissionId,
          success: true,
        });
      } catch (error) {
        results.push({
          permissionId,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.BulkPermissionsAssigned",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          entityType: input.entityType,
          entityId: input.entityId,
          total: input.permissionIds.length,
          success,
          failed,
        },
      });
    }

    return {
      total: input.permissionIds.length,
      success,
      failed,
      results,
    };
  }

  private async validateEntity(
    entityType: "department" | "sector" | "position" | "user",
    entityId: string,
    orgId: string,
  ): Promise<void> {
    switch (entityType) {
      case "department":
        if (!this.deps.departmentRepository) {
          throw new Error("DepartmentRepository não disponível");
        }
        const department = await this.deps.departmentRepository.encontrarPorId(orgId, entityId);
        if (!department) {
          throw new Error("Departamento não encontrado");
        }
        break;
      case "sector":
        if (!this.deps.sectorRepository) {
          throw new Error("SectorRepository não disponível");
        }
        const sector = await this.deps.sectorRepository.encontrarPorId(orgId, entityId);
        if (!sector) {
          throw new Error("Setor não encontrado");
        }
        break;
      case "position":
        if (!this.deps.positionRepository) {
          throw new Error("PositionRepository não disponível");
        }
        const position = await this.deps.positionRepository.encontrarPorId(orgId, entityId);
        if (!position) {
          throw new Error("Cargo não encontrado");
        }
        break;
      case "user":
        // Usuário será validado pela rota de usuário, não precisamos validar aqui
        break;
      default:
        throw new Error(`Tipo de entidade inválido: ${entityType}`);
    }
  }

  private async grantPermission(
    entityType: "department" | "sector" | "position" | "user",
    entityId: string,
    orgId: string,
    permissionId: string,
    reason?: string,
  ): Promise<void> {
    const agora = new Date();

    switch (entityType) {
      case "department":
        if (!this.deps.departmentPermissionRepository) {
          throw new Error("DepartmentPermissionRepository não disponível");
        }
        const deptExistente =
          await this.deps.departmentPermissionRepository.encontrarPorDepartmentEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (deptExistente) {
          await this.deps.departmentPermissionRepository.salvar({
            ...deptExistente,
            granted: true,
            updatedBy: this.deps.actorId,
            updatedAt: agora,
          });
        } else {
          await this.deps.departmentPermissionRepository.salvar({
            id: randomUUID(),
            orgId,
            departmentId: entityId,
            permissionId,
            granted: true,
            createdBy: this.deps.actorId,
            updatedBy: this.deps.actorId,
            createdAt: agora,
            updatedAt: agora,
          });
        }
        break;
      case "sector":
        if (!this.deps.sectorPermissionRepository) {
          throw new Error("SectorPermissionRepository não disponível");
        }
        const sectorExistente =
          await this.deps.sectorPermissionRepository.encontrarPorSectorEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (sectorExistente) {
          await this.deps.sectorPermissionRepository.salvar({
            ...sectorExistente,
            granted: true,
            updatedBy: this.deps.actorId,
            updatedAt: agora,
          });
        } else {
          await this.deps.sectorPermissionRepository.salvar({
            id: randomUUID(),
            orgId,
            sectorId: entityId,
            permissionId,
            granted: true,
            createdBy: this.deps.actorId,
            updatedBy: this.deps.actorId,
            createdAt: agora,
            updatedAt: agora,
          });
        }
        break;
      case "position":
        if (!this.deps.positionPermissionRepository) {
          throw new Error("PositionPermissionRepository não disponível");
        }
        const posExistente =
          await this.deps.positionPermissionRepository.encontrarPorPositionEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (posExistente) {
          await this.deps.positionPermissionRepository.salvar({
            ...posExistente,
            granted: true,
            updatedBy: this.deps.actorId,
            updatedAt: agora,
          });
        } else {
          await this.deps.positionPermissionRepository.salvar({
            id: randomUUID(),
            orgId,
            positionId: entityId,
            permissionId,
            granted: true,
            createdBy: this.deps.actorId,
            updatedBy: this.deps.actorId,
            createdAt: agora,
            updatedAt: agora,
          });
        }
        break;
      case "user":
        if (!this.deps.userPermissionRepository) {
          throw new Error("UserPermissionRepository não disponível");
        }
        const userExistente = await this.deps.userPermissionRepository.encontrarPorUserEPermission(
          orgId,
          entityId,
          permissionId,
        );
        if (userExistente) {
          await this.deps.userPermissionRepository.salvar({
            ...userExistente,
            granted: true,
            updatedBy: this.deps.actorId,
            updatedAt: agora,
          });
        } else {
          await this.deps.userPermissionRepository.salvar({
            id: randomUUID(),
            orgId,
            userId: entityId,
            permissionId,
            granted: true,
            createdBy: this.deps.actorId,
            updatedBy: this.deps.actorId,
            createdAt: agora,
            updatedAt: agora,
          });
        }
        break;
    }

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId,
        entityType,
        entityId,
        permissionId,
        action: "granted",
        granted: true,
        previousValue: null,
        actorId: this.deps.actorId,
        reason: reason ?? null,
        metadata: null,
        createdAt: agora,
      });
    }
  }

  private async revokePermission(
    entityType: "department" | "sector" | "position" | "user",
    entityId: string,
    orgId: string,
    permissionId: string,
    reason?: string,
  ): Promise<void> {
    const agora = new Date();

    switch (entityType) {
      case "department":
        if (!this.deps.departmentPermissionRepository) {
          throw new Error("DepartmentPermissionRepository não disponível");
        }
        const deptExistente =
          await this.deps.departmentPermissionRepository.encontrarPorDepartmentEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (deptExistente) {
          await this.deps.departmentPermissionRepository.deletarPorDepartmentEPermission(
            orgId,
            entityId,
            permissionId,
          );
        }
        break;
      case "sector":
        if (!this.deps.sectorPermissionRepository) {
          throw new Error("SectorPermissionRepository não disponível");
        }
        const sectorExistente =
          await this.deps.sectorPermissionRepository.encontrarPorSectorEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (sectorExistente) {
          await this.deps.sectorPermissionRepository.deletarPorSectorEPermission(
            orgId,
            entityId,
            permissionId,
          );
        }
        break;
      case "position":
        if (!this.deps.positionPermissionRepository) {
          throw new Error("PositionPermissionRepository não disponível");
        }
        const posExistente =
          await this.deps.positionPermissionRepository.encontrarPorPositionEPermission(
            orgId,
            entityId,
            permissionId,
          );
        if (posExistente) {
          await this.deps.positionPermissionRepository.deletarPorPositionEPermission(
            orgId,
            entityId,
            permissionId,
          );
        }
        break;
      case "user":
        if (!this.deps.userPermissionRepository) {
          throw new Error("UserPermissionRepository não disponível");
        }
        const userExistente = await this.deps.userPermissionRepository.encontrarPorUserEPermission(
          orgId,
          entityId,
          permissionId,
        );
        if (userExistente) {
          await this.deps.userPermissionRepository.deletarPorUserEPermission(
            orgId,
            entityId,
            permissionId,
          );
        }
        break;
    }

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId,
        entityType,
        entityId,
        permissionId,
        action: "removed",
        granted: null,
        previousValue: true,
        actorId: this.deps.actorId,
        reason: reason ?? null,
        metadata: null,
        createdAt: agora,
      });
    }
  }
}



