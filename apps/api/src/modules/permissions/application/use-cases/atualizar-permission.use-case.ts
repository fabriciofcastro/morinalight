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
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = atualizarPermissionInputSchema.parse(rawInput);

        const permission = await this.deps.permissionRepository.encontrarPorId(input.id);

        if (!permission) {
            throw new Error("Permissão não encontrada");
        }

        // Update logic would go here if Permission entity supported updates.
        // Assuming Permission entity is immutable or we need to add update methods.
        // For now, let's assume we can't update core permission properties easily without migration scripts,
        // but let's check the entity again.

        // Based on previous view, Permission entity has no update method.
        // I will add one if needed, but for now I'll just throw if not implemented.

        throw new Error("Atualização de permissão não implementada");
    }
}
