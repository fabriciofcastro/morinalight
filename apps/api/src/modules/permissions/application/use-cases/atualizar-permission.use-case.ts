import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import { atualizarPermissionInputSchema, permissionViewSchema } from "../schemas/permission.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarPermissionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarPermissionInputSchema.parse(rawInput);

    const permission = await this.deps.permissionRepository.encontrarPorId(input.id);

    if (!permission) {
      throw new Error("Permissão não encontrada");
    }

    const existingKey = permission.permissionKey;
    const [existingResource, existingAction] = existingKey.includes(":")
      ? existingKey.split(":", 2)
      : [existingKey, permission.dados.level];

    const nextResource = input.resource ?? existingResource;
    const nextAction = input.action ?? existingAction;
    const nextCode = `${nextResource}:${nextAction}`;

    permission.atualizarDados({
      name: input.name,
      description: input.description,
      module: input.module,
      code: nextCode,
      level: nextAction,
    });

    await this.deps.permissionRepository.salvar(permission);

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.PermissionUpdated",
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
      category: input.category ?? permission.dados.module,
      resource: nextResource,
      action: nextAction,
      createdAt: permission.dados.createdAt,
      updatedAt: permission.dados.updatedAt,
    });
  }
}
