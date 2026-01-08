import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { Sector } from "../../domain/entities/sector";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import {
  calculateHierarchyDepth,
  hasHierarchyLoop,
  wouldExceedMaxDepth,
} from "../../domain/utils/hierarchy-validator";
import { atualizarSectorInputSchema, sectorViewSchema } from "../schemas/sector.schema";

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
      const sectorComCode = await this.deps.sectorRepository.encontrarPorCode(
        input.orgId,
        input.code,
      );

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

        // Evitar referência circular e loops hierárquicos
        if (input.parentId === sector.sectorId) {
          throw new Error("Setor não pode ser pai de si mesmo");
        }

        // Verificar loops hierárquicos
        const hasLoop = await hasHierarchyLoop(
          sector.sectorId,
          input.parentId,
          async (id: string) => {
            const sect = await this.deps.sectorRepository.encontrarPorId(input.orgId, id);
            return sect ? ({ id: sect.sectorId, parentId: sect.dados.parentId } as Sector) : null;
          },
        );

        if (hasLoop) {
          throw new Error(
            "Não é possível criar hierarquia circular. O setor pai é descendente deste setor.",
          );
        }

        // Verificar profundidade máxima
        const currentDepth = await calculateHierarchyDepth(sector.sectorId, async (id: string) => {
          const sect = await this.deps.sectorRepository.encontrarPorId(input.orgId, id);
          return sect ? ({ id: sect.sectorId, parentId: sect.dados.parentId } as Sector) : null;
        });

        const wouldExceed = await wouldExceedMaxDepth(
          currentDepth,
          input.parentId,
          async (id: string) => {
            const sect = await this.deps.sectorRepository.encontrarPorId(input.orgId, id);
            return sect ? ({ id: sect.sectorId, parentId: sect.dados.parentId } as Sector) : null;
          },
        );

        if (wouldExceed) {
          throw new Error("Profundidade máxima da hierarquia seria excedida. Limite: 10 níveis.");
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
