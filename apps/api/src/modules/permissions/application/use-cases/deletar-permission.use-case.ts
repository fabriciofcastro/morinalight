import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";

type Dependencies = {
  permissionRepository: PermissionRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

const inputSchema = z.object({
  permissionId: z.string().uuid(),
});

export class DeletarPermissionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = inputSchema.parse(rawInput);

    const permission = await this.deps.permissionRepository.encontrarPorId(input.permissionId);

    if (!permission) {
      throw new Error("Permissão não encontrada");
    }

    // Check if permission is in use?
    // For now, just delete.
    const repo = this.deps.permissionRepository as PermissionRepository & {
      deletar?: (permissionId: string) => Promise<void>;
    };
    if (!repo.deletar) {
      throw new Error("Método deletar não implementado no repositório");
    }
    await repo.deletar(input.permissionId);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.PermissionDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: "SYSTEM",
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          permissionId: permission.permissionId,
        },
      });
    }
  }
}
