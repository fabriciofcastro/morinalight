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
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = criarPermissionInputSchema.parse(rawInput);

        const permission = Permission.criar({
            name: input.name,
            code: input.name.toUpperCase().replace(/\s+/g, "_"), // Generate code from name if not provided
            description: input.description ?? null,
            module: input.module,
            level: "READ", // Default level
        });

        await this.deps.permissionRepository.salvar(permission);

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "Permissions.PermissionCreated",
                version: "v1",
                metadata: {
                    eventId: randomUUID(),
                    orgId: "SYSTEM",
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
            category: permission.dados.module, // Map module to category for legacy support
            resource: permission.dados.code, // Map code to resource for legacy support
            action: permission.dados.level, // Map level to action for legacy support
            createdAt: permission.dados.createdAt,
            updatedAt: permission.dados.updatedAt,
        });
    }
}
