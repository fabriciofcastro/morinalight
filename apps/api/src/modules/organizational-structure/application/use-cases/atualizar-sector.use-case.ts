import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { atualizarSectorInputSchema, sectorViewSchema } from "../schemas/sector.schema";
import { randomUUID } from "crypto";

type Dependencies = {
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarSectorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarSectorInputSchema.parse(rawInput);

    // Encontrar setor existente
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);

    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Verificar se código já existe em outro setor (se alterado)
    if (input.code && input.code !== sector.dados.code) {
      const sectorComCode = await this.deps.sectorRepository.encontrarPorCode(input.orgId, input.code);

      if (sectorComCode && sectorComCode.sectorId !== sector.sectorId) {
        throw new Error("Setor com este código já existe");
      }
    }

    // Verificar se parentId existe (se fornecido e diferente do atual)
    if (input.parentId !== undefined && input.parentId !== sector.dados.parentId) {
      if (input.parentId) {
        const parent = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.parentId);

        if (!parent) {
          throw new Error("Setor pai não encontrado");
        }

        // Evitar referência circular
        if (input.parentId === sector.sectorId) {
          throw new Error("Setor não pode ser pai de si mesmo");
        }
      }
    }

    // Atualizar dados
    sector.atualizarDados(
      {
        name: input.name,
        code: input.code,
        description: input.description,
        parentId: input.parentId,
        status: input.status,
        ordem: input.ordem,
        metadata: input.metadata,
      },
      this.deps.actorId,
    );

    await this.deps.sectorRepository.salvar(sector);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: sector.dados.orgId,
        entityType: "sector",
        entityId: sector.sectorId,
        action: "updated",
        actorId: this.deps.actorId,
        payload: {
          changes: input,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SectorUpdated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: sector.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          sectorId: sector.sectorId,
          name: sector.dados.name,
          code: sector.dados.code,
          status: sector.dados.status,
        },
      });
    }

    return sectorViewSchema.parse({
      id: sector.sectorId,
      orgId: sector.dados.orgId,
      departmentId: sector.dados.departmentId,
      name: sector.dados.name,
      code: sector.dados.code,
      description: sector.dados.description ?? null,
      parentId: sector.dados.parentId ?? null,
      status: sector.dados.status,
      ordem: sector.dados.ordem,
      metadata: sector.dados.metadata ?? null,
      createdBy: sector.dados.createdBy,
      updatedBy: sector.dados.updatedBy,
      createdAt: sector.dados.createdAt,
      updatedAt: sector.dados.updatedAt,
    });
  }
}

