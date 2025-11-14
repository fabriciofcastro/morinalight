import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import {
  atualizarOrganizationalUnitInputSchema,
  organizationalUnitViewSchema,
} from "../schemas/organizational-unit.schema";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarOrganizationalUnitUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarOrganizationalUnitInputSchema.parse(rawInput);

    const unit = await this.deps.organizationalUnitRepository.encontrarPorId(
      input.orgId,
      input.unitId,
    );

    if (!unit) {
      throw new Error("Unidade organizacional não encontrada");
    }

    // Verificar se novo código já existe (se fornecido e diferente do atual)
    if (input.code !== undefined && input.code !== unit.dados.code) {
      const unitExistente = await this.deps.organizationalUnitRepository.encontrarPorCode(
        input.orgId,
        input.code,
      );

      if (unitExistente) {
        throw new Error("Unidade organizacional com este código já existe");
      }
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId !== undefined && input.parentId !== null) {
      const parent = await this.deps.organizationalUnitRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Unidade pai não encontrada");
      }

      // Evitar referência circular (não permitir que a unidade seja pai de si mesma)
      if (input.parentId === unit.unitId) {
        throw new Error("Unidade não pode ser pai de si mesma");
      }
    }

    // Atualizar dados
    unit.atualizarDados(
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

    await this.deps.organizationalUnitRepository.salvar(unit);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: unit.dados.orgId,
        entityType: "unit",
        entityId: unit.unitId,
        action: "updated",
        actorId: this.deps.actorId,
        payload: {
          name: unit.dados.name,
          code: unit.dados.code,
          status: unit.dados.status,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.UnitUpdated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: unit.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          unitId: unit.unitId,
          name: unit.dados.name,
          code: unit.dados.code,
          status: unit.dados.status,
        },
      });
    }

    return organizationalUnitViewSchema.parse({
      unitId: unit.unitId,
      orgId: unit.dados.orgId,
      name: unit.dados.name,
      code: unit.dados.code,
      description: unit.dados.description ?? null,
      parentId: unit.dados.parentId ?? null,
      status: unit.dados.status,
      ordem: unit.dados.ordem,
      metadata: unit.dados.metadata ?? null,
      createdBy: unit.dados.createdBy,
      updatedBy: unit.dados.updatedBy,
      createdAt: unit.dados.createdAt,
      updatedAt: unit.dados.updatedAt,
    });
  }
}
