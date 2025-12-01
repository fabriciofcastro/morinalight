import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { RoleRepository } from "../../domain/repositories/role-repository";
import { atualizarRoleInputSchema, roleViewSchema } from "../schemas/role.schema";

type Dependencies = {
    roleRepository: RoleRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

export class AtualizarRoleUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = atualizarRoleInputSchema.parse(rawInput);

        const role = await this.deps.roleRepository.findById(input.roleId);

        if (!role || role.dados.orgId !== input.orgId) {
            throw new Error("Perfil não encontrado");
        }

        role.atualizarDados({
            name: input.name,
            description: input.description,
            updatedBy: this.deps.actorId,
        });

        await this.deps.roleRepository.save(role);

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "Permissions.RoleUpdated",
                version: "v1",
                metadata: {
                    eventId: randomUUID(),
                    orgId: role.dados.orgId,
                    actorId: this.deps.actorId,
                    timestamp: new Date(),
                },
                payload: {
                    roleId: role.roleId,
                    name: role.dados.name,
                },
            });
        }

        return roleViewSchema.parse({
            roleId: role.roleId,
            orgId: role.dados.orgId,
            name: role.dados.name,
            description: role.dados.description ?? null,
            isCustom: true, // Legacy support
            createdAt: role.dados.createdAt,
            updatedAt: role.dados.updatedAt,
        });
    }
}
