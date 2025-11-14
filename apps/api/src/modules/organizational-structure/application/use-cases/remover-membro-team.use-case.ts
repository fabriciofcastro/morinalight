import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import type { TeamMembershipRepository } from "../../infra/prisma/prisma-team-membership.repository";
import {
  type RemoverMembroTeamInput,
  removerMembroTeamInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  teamMembershipRepository: TeamMembershipRepository;
  teamRepository: TeamRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RemoverMembroTeamUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: RemoverMembroTeamInput = removerMembroTeamInputSchema.parse(rawInput);

    // Verificar se o time existe
    const team = await this.deps.teamRepository.encontrarPorId(input.orgId, input.teamId);
    if (!team) {
      throw new Error("Time não encontrado");
    }

    // Verificar se o membro existe
    const membership = await this.deps.teamMembershipRepository.encontrar(
      input.orgId,
      input.teamId,
      input.userId,
    );
    if (!membership) {
      throw new Error("Membro não encontrado");
    }

    // Remover membro
    await this.deps.teamMembershipRepository.remover(input.orgId, input.teamId, input.userId);

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "team",
        entityId: input.teamId,
        action: "member_removed",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: membership.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.team.member-removed",
        payload: {
          orgId: input.orgId,
          teamId: input.teamId,
          userId: input.userId,
          actorId: this.deps.actorId,
        },
      });
    }
  }
}
