import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Role } from "../../domain/entities/role";
import type { RoleRepository } from "../../domain/repositories/role-repository";
import { criarRoleInputSchema, roleViewSchema } from "../schemas/role.schema";

type Dependencies = {
  roleRepository: RoleRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarRoleUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarRoleInputSchema.parse(rawInput);

    const role = Role.criar({
      orgId: input.orgId,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      scope: input.scope,
      active: input.active,
    });

    await this.deps.roleRepository.save(role);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Permissions.RoleCreated",
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
      code: role.dados.code,
      description: role.dados.description ?? null,
      scope: role.dados.scope,
      active: role.dados.active,
      isCustom: true, // Legacy support for schema
      createdAt: role.dados.createdAt,
      updatedAt: role.dados.updatedAt,
    });
  }
}
