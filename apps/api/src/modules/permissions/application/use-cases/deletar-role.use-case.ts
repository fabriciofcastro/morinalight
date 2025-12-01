import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { RoleRepository } from "../../domain/repositories/role-repository";
import { z } from "zod";

type Dependencies = {
    roleRepository: RoleRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

const inputSchema = z.object({
    orgId: z.string().min(1),
    roleId: z.string().uuid(),
});

export class DeletarRoleUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = inputSchema.parse(rawInput);

        const role = await this.deps.roleRepository.findById(input.roleId);

        if (!role || role.dados.orgId !== input.orgId) {
            throw new Error("Perfil não encontrado");
        }

        await this.deps.roleRepository.delete(input.roleId);

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "Permissions.RoleDeleted",
                version: "v1",
                metadata: {
                    eventId: randomUUID(),
                    orgId: role.dados.orgId,
                    actorId: this.deps.actorId,
                    timestamp: new Date(),
                },
                payload: {
                    roleId: role.roleId,
                },
            });
        }
    }
}
