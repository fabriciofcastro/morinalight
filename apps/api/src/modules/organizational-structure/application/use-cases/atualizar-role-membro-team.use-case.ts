import { z } from "zod";

import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import { organizationRoleSchema } from "../schemas/membership.schema";
import type {
  TeamMembershipRepository,
} from "../../infra/prisma/prisma-team-membership.repository";

const atualizarRoleMembroTeamInputSchema = z.object({
  orgId: z.string().min(1),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

type AtualizarRoleMembroTeamInput = z.infer<typeof atualizarRoleMembroTeamInputSchema>;

type Dependencies = {
  teamMembershipRepository: TeamMembershipRepository;
  teamRepository: TeamRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarRoleMembroTeamUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AtualizarRoleMembroTeamInput = atualizarRoleMembroTeamInputSchema.parse(rawInput);

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

    // Verificar se o role está mudando
    if (membership.role === input.role) {
      return membership;
    }

    const roleAnterior = membership.role;

    // Atualizar role
    const updatedMembership = await this.deps.teamMembershipRepository.atualizarRole(
      input.orgId,
      input.teamId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "team",
        entityId: input.teamId,
        action: "member_role_updated",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          roleAnterior,
          novoRole: input.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.team.member-role-updated",
        payload: {
          orgId: input.orgId,
          teamId: input.teamId,
          userId: input.userId,
          roleAnterior,
          novoRole: input.role,
          actorId: this.deps.actorId,
        },
      });
    }

    return updatedMembership;
  }
}

