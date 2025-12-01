import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import { z } from "zod";

type Dependencies = {
    permissionRepository: PermissionRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

const inputSchema = z.object({
    permissionId: z.string().uuid(),
});

export class DeletarPermissionUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = inputSchema.parse(rawInput);

        const permission = await this.deps.permissionRepository.encontrarPorId(input.permissionId);

        if (!permission) {
            throw new Error("Permissão não encontrada");
        }

        // Check if permission is in use?
        // For now, just delete.
        // Note: PermissionRepository interface needs to be updated to include 'deletar'
        if ('deletar' in this.deps.permissionRepository) {
            await (this.deps.permissionRepository as any).deletar(input.permissionId);
        } else {
            throw new Error("Método deletar não implementado no repositório");
        }

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
