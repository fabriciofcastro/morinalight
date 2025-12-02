import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../../infra/prisma/prisma-position-membership.repository";
import { deletarPositionInputSchema } from "../schemas/position.schema";

type Dependencies = {
  positionRepository: PositionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarPositionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarPositionInputSchema.parse(rawInput);

    // Encontrar cargo
    const position = await this.deps.positionRepository.encontrarPorId(
      input.orgId,
      input.positionId,
    );

    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Verificar se existem membros associados ao cargo
    if (this.deps.positionMembershipRepository) {
      const memberCount = await this.deps.positionMembershipRepository.contarPorPosition(
        input.orgId,
        input.positionId,
      );

      if (memberCount > 0) {
        throw new Error(
          "Não é possível deletar cargo com membros associados. Remova todos os membros primeiro.",
        );
      }
    }

    // Arquivar ao invés de deletar fisicamente para manter histórico
    position.arquivar(this.deps.actorId);
    await this.deps.positionRepository.salvar(position);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "position",
        entityId: input.positionId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: position.dados.name,
          code: position.dados.code,
          sectorId: position.dados.sectorId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.PositionDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          positionId: input.positionId,
          name: position.dados.name,
          code: position.dados.code,
        },
      });
    }
  }
}
