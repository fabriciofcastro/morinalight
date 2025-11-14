import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { OrganizationalUnit } from "../../domain/entities/organizational-unit";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import {
  criarOrganizationalUnitInputSchema,
  organizationalUnitViewSchema,
} from "../schemas/organizational-unit.schema";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarOrganizationalUnitUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarOrganizationalUnitInputSchema.parse(rawInput);

    // Verificar se já existe unidade com este código
    const unitExistente = await this.deps.organizationalUnitRepository.encontrarPorCode(
      input.orgId,
      input.code,
    );

    if (unitExistente) {
      throw new Error("Unidade organizacional com este código já existe");
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId) {
      const parent = await this.deps.organizationalUnitRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Unidade pai não encontrada");
      }
    }

    const unit = OrganizationalUnit.criar({
      orgId: input.orgId,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      status: input.status ?? "ativo",
      ordem: input.ordem ?? 0,
      metadata: input.metadata ?? null,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.organizationalUnitRepository.salvar(unit);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: unit.dados.orgId,
        entityType: "unit",
        entityId: unit.unitId,
        action: "created",
        actorId: this.deps.actorId,
        payload: {
          name: unit.dados.name,
          code: unit.dados.code,
          parentId: unit.dados.parentId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.UnitCreated",
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
