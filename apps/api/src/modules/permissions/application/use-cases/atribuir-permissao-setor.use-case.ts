import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";

const atribuirPermissaoSetorInputSchema = z.object({
  orgId: z.string().uuid(),
  sectorId: z.string().uuid(),
  permissionId: z.string(), // Pode ser ID ou chave (resource:action)
  granted: z.boolean().default(true),
  reason: z.string().optional(), // Motivo da mudança (opcional)
});

type Dependencies = {
  sectorPermissionRepository: SectorPermissionRepository;
  sectorRepository: SectorRepository;
  permissionRepository: PermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  actorId: string;
  eventBus?: DomainEventBus;
};

export class AtribuirPermissaoSetorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atribuirPermissaoSetorInputSchema.parse(rawInput);

    // Verificar se o setor existe
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);

    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Verificar se a permissão existe (por ID ou chave)
    let permissionId = input.permissionId;
    let permission = await this.deps.permissionRepository.encontrarPorId(input.permissionId);

    if (!permission) {
      // Tentar buscar por chave (resource:action)
      const [resource, action] = input.permissionId.split(":");
      if (resource && action) {
        permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);
        if (permission) {
          permissionId = permission.permissionId;
        }
      }
    } else {
      permissionId = permission.permissionId;
    }

    if (!permission) {
      throw new Error("Permissão não encontrada");
    }

    // Verificar se já existe permissão para este setor
    const existente = await this.deps.sectorPermissionRepository.encontrarPorSectorEPermission(
      input.orgId,
      input.sectorId,
      permissionId,
    );

    const previousValue = existente?.granted ?? null;
    const action: "granted" | "denied" | "removed" = input.granted ? "granted" : "denied";

    if (existente) {
      // Atualizar permissão existente
      await this.deps.sectorPermissionRepository.salvar({
        ...existente,
        granted: input.granted,
        updatedBy: this.deps.actorId,
        updatedAt: new Date(),
      });
    } else {
      // Criar nova permissão
      await this.deps.sectorPermissionRepository.salvar({
        id: randomUUID(),
        orgId: input.orgId,
        sectorId: input.sectorId,
        permissionId,
        granted: input.granted,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.deps.actorId,
        updatedBy: this.deps.actorId,
      });
    }

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "sector",
        entityId: input.sectorId,
        permissionId,
        action,
        granted: input.granted,
        previousValue,
        actorId: this.deps.actorId,
        reason: input.reason ?? null,
        metadata: {
          permissionKey: permission?.permissionKey || permissionId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento (mensageria)
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.SectorPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          entityType: "sector",
          entityId: input.sectorId,
          permissionId,
          permissionKey: permission?.permissionKey || permissionId,
          granted: input.granted,
          previousValue,
          reason: input.reason ?? null,
        },
      });
    }

    return {
      success: true,
      sectorId: input.sectorId,
      permissionId,
      granted: input.granted,
    };
  }
}
