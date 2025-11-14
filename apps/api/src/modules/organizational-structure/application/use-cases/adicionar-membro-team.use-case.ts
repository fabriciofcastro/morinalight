import type { DomainEventBus } from "@morina/shared-kernel";
import type { UserRepository } from "../../../users/repositories/user.repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import type { TeamMembershipRepository } from "../../infra/prisma/prisma-team-membership.repository";
import {
  type AdicionarMembroTeamInput,
  adicionarMembroTeamInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  teamMembershipRepository: TeamMembershipRepository;
  teamRepository: TeamRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AdicionarMembroTeamUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AdicionarMembroTeamInput = adicionarMembroTeamInputSchema.parse(rawInput);

    // Verificar se o time existe
    const team = await this.deps.teamRepository.encontrarPorId(input.orgId, input.teamId);
    if (!team) {
      throw new Error("Time não encontrado");
    }

    // Verificar se o usuário existe
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro
    const existingMembership = await this.deps.teamMembershipRepository.encontrar(
      input.orgId,
      input.teamId,
      input.userId,
    );
    if (existingMembership) {
      throw new Error("Usuário já é membro deste time");
    }

    // Adicionar membro
    const membership = await this.deps.teamMembershipRepository.adicionar(
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
        action: "member_added",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: input.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.team.member-added",
        payload: {
          orgId: input.orgId,
          teamId: input.teamId,
          userId: input.userId,
          role: input.role,
          actorId: this.deps.actorId,
        },
      });
    }

    return membership;
  }
}
