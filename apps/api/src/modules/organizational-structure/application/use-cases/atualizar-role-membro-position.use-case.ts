import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../../infra/prisma/prisma-position-membership.repository";
import { organizationRoleSchema } from "../schemas/membership.schema";

const atualizarRoleMembroCargoInputSchema = z.object({
  orgId: z.string().min(1),
  positionId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

type AtualizarRoleMembroCargoInput = z.infer<typeof atualizarRoleMembroCargoInputSchema>;

type Dependencies = {
  positionMembershipRepository: PositionMembershipRepository;
  positionRepository: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarRoleMembroCargoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AtualizarRoleMembroCargoInput =
      atualizarRoleMembroCargoInputSchema.parse(rawInput);

    // Verificar se o cargo existe
    const position = await this.deps.positionRepository.encontrarPorId(
      input.orgId,
      input.positionId,
    );
    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Verificar se o membro existe
    const membership = await this.deps.positionMembershipRepository.encontrar(
      input.orgId,
      input.positionId,
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
    const updatedMembership = await this.deps.positionMembershipRepository.atualizarRole(
      input.orgId,
      input.positionId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "position",
        entityId: input.positionId,
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
        type: "organizational-structure.position.member-role-updated",
        payload: {
          orgId: input.orgId,
          positionId: input.positionId,
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

