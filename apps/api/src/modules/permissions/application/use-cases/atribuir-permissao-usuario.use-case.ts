import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { OrganizationRepository } from "../../../organizations/repositories/organization.repository";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { UserPermissionRepository } from "../../domain/repositories/user-permission-repository";

const atribuirPermissaoUsuarioInputSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  permissionId: z.string(), // Pode ser ID ou chave (resource:action)
  granted: z.boolean().default(true),
  reason: z.string().optional(),
});

type Dependencies = {
  userPermissionRepository: UserPermissionRepository;
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  actorId: string;
  eventBus?: DomainEventBus;
};

export class AtribuirPermissaoUsuarioUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atribuirPermissaoUsuarioInputSchema.parse(rawInput);

    const membership = await this.deps.organizationRepository.encontrarMembership?.(
      input.orgId,
      input.userId,
    );
    if (!membership) {
      throw new Error("Usuário não pertence à organização");
    }

    // Verificar permissão por ID ou chave
    let permissionId = input.permissionId;
    let permission = await this.deps.permissionRepository.encontrarPorId(input.permissionId);

    if (!permission) {
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

    const existente = await this.deps.userPermissionRepository.encontrarPorUserEPermission(
      input.orgId,
      input.userId,
      permissionId,
    );

    const previousValue = existente?.granted ?? null;
    const action: "granted" | "denied" | "removed" = input.granted ? "granted" : "denied";

    await this.deps.userPermissionRepository.salvar({
      id: existente?.id ?? randomUUID(),
      orgId: input.orgId,
      userId: input.userId,
      permissionId,
      granted: input.granted,
      reason: input.reason ?? null,
      createdAt: existente?.createdAt ?? new Date(),
      updatedAt: new Date(),
      createdBy: existente?.createdBy ?? this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "user",
        entityId: input.userId,
        permissionId,
        action,
        granted: input.granted,
        previousValue,
        actorId: this.deps.actorId,
        reason: input.reason ?? null,
        metadata: {
          permissionKey: permission.permissionKey,
        },
        createdAt: new Date(),
      });
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.UserPermissionChanged",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          entityType: "user",
          entityId: input.userId,
          permissionId,
          permissionKey: permission.permissionKey,
          granted: input.granted,
          previousValue,
          reason: input.reason ?? null,
        },
      });
    }

    return {
      success: true,
      userId: input.userId,
      permissionId,
      granted: input.granted,
    };
  }
}
