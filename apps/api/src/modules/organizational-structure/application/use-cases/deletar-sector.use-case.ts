import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { deletarSectorInputSchema } from "../schemas/sector.schema";
import { randomUUID } from "crypto";

type Dependencies = {
  sectorRepository: SectorRepository;
  positionRepository?: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarSectorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarSectorInputSchema.parse(rawInput);

    // Encontrar setor
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);

    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Verificar se existem setores filhos
    const filhos = await this.deps.sectorRepository.listarPorOrg(input.orgId, {
      parentId: input.sectorId,
      limite: 1,
    });

    if (filhos.itens.length > 0) {
      throw new Error("Não é possível deletar setor com setores filhos. Remova os setores filhos primeiro.");
    }

    // Verificar se existem cargos associados
    if (this.deps.positionRepository) {
      const cargos = await this.deps.positionRepository.listarPorOrg(input.orgId, {
        sectorId: input.sectorId,
        limite: 1,
      });

      if (cargos.itens.length > 0) {
        throw new Error("Não é possível deletar setor com cargos associados. Remova os cargos primeiro.");
      }
    }

    await this.deps.sectorRepository.deletar(input.orgId, input.sectorId);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "sector",
        entityId: input.sectorId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: sector.dados.name,
          code: sector.dados.code,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SectorDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          sectorId: input.sectorId,
          name: sector.dados.name,
          code: sector.dados.code,
        },
      });
    }
  }
}

