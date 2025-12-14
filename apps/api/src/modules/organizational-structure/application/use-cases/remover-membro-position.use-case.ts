import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../../infra/prisma/prisma-position-membership.repository";
import {
  type RemoverMembroCargoInput,
  removerMembroCargoInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  positionMembershipRepository: PositionMembershipRepository;
  positionRepository: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RemoverMembroCargoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: RemoverMembroCargoInput = removerMembroCargoInputSchema.parse(rawInput);

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

    // Remover membro
    await this.deps.positionMembershipRepository.remover(
      input.orgId,
      input.positionId,
      input.userId,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "position",
        entityId: input.positionId,
        action: "member_removed",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: membership.role,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.PositionMemberRemoved",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          positionId: input.positionId,
          userId: input.userId,
        },
      });
    }
  }
}
