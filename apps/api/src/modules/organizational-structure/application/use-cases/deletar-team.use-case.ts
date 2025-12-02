import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import type { TeamMembershipRepository } from "../../infra/prisma/prisma-team-membership.repository";

const deletarTeamInputSchema = z.object({
  orgId: z.string().min(1),
  teamId: z.string().uuid(),
});

type Dependencies = {
  teamRepository: TeamRepository;
  teamMembershipRepository?: TeamMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarTeamUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarTeamInputSchema.parse(rawInput);

    const team = await this.deps.teamRepository.encontrarPorId(input.orgId, input.teamId);

    if (!team) {
      throw new Error("Time não encontrado");
    }

    // Verificar se há membros
    if (this.deps.teamMembershipRepository) {
      const memberCount = await this.deps.teamMembershipRepository.contarPorTeam(
        input.orgId,
        input.teamId,
      );

      if (memberCount > 0) {
        throw new Error(
          "Não é possível deletar time com membros. Remova todos os membros primeiro.",
        );
      }
    }

    // Arquivar ao invés de deletar fisicamente para manter histórico
    team.arquivar(this.deps.actorId);
    await this.deps.teamRepository.salvar(team);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: team.dados.orgId,
        entityType: "team",
        entityId: team.teamId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: team.dados.name,
          code: team.dados.code,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.TeamDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: team.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          teamId: team.teamId,
          name: team.dados.name,
          code: team.dados.code,
        },
      });
    }

    return { success: true };
  }
}
