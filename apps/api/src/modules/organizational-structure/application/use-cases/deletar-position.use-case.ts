import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { deletarPositionInputSchema } from "../schemas/position.schema";
import { randomUUID } from "crypto";

type Dependencies = {
  positionRepository: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarPositionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarPositionInputSchema.parse(rawInput);

    // Encontrar cargo
    const position = await this.deps.positionRepository.encontrarPorId(input.orgId, input.positionId);

    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // TODO: Verificar se existem membros associados ao cargo
    // Se houver PositionMembership, verificar antes de deletar

    await this.deps.positionRepository.deletar(input.orgId, input.positionId);

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

