import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Permission } from "../../domain/entities/permission";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import { criarPermissionInputSchema, permissionViewSchema } from "../schemas/permission.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarPermissionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPermissionInputSchema.parse(rawInput);

    const permission = Permission.criar({
      name: input.name,
      code: `${input.resource}:${input.action}`,
      description: input.description ?? null,
      module: input.module,
      level: input.action,
    });

    await this.deps.permissionRepository.salvar(permission);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.PermissionCreated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: "unknown",
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          permissionId: permission.permissionId,
          name: permission.dados.name,
          code: permission.dados.code,
        },
      });
    }

    return permissionViewSchema.parse({
      permissionId: permission.permissionId,
      name: permission.dados.name,
      description: permission.dados.description ?? null,
      module: permission.dados.module,
      category: input.category,
      resource: input.resource,
      action: input.action,
      createdAt: permission.dados.createdAt,
      updatedAt: permission.dados.updatedAt,
    });
  }
}
