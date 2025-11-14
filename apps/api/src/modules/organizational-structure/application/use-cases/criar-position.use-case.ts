import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Position } from "../../domain/entities/position";
import { criarPositionInputSchema, positionViewSchema } from "../schemas/position.schema";
import { randomUUID } from "crypto";

type Dependencies = {
  positionRepository: PositionRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarPositionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPositionInputSchema.parse(rawInput);

    // Verificar se já existe cargo com este código
    const positionExistente = await this.deps.positionRepository.encontrarPorCode(input.orgId, input.code);

    if (positionExistente) {
      throw new Error("Cargo com este código já existe");
    }

    // Verificar se sectorId existe
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);

    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Validar faixa salarial
    if (input.salarioMin && input.salarioMax && input.salarioMin > input.salarioMax) {
      throw new Error("Salário mínimo não pode ser maior que salário máximo");
    }

    const position = Position.criar({
      orgId: input.orgId,
      sectorId: input.sectorId,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      responsabilidades: input.responsabilidades ?? null,
      requisitos: input.requisitos ?? null,
      salarioMin: input.salarioMin ?? null,
      salarioMax: input.salarioMax ?? null,
      metadata: input.metadata ?? null,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.positionRepository.salvar(position);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: position.dados.orgId,
        entityType: "position",
        entityId: position.positionId,
        action: "created",
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
        name: "OrganizationalStructure.PositionCreated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: position.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          positionId: position.positionId,
          name: position.dados.name,
          code: position.dados.code,
          sectorId: position.dados.sectorId,
          status: position.dados.status,
        },
      });
    }

    return positionViewSchema.parse({
      id: position.positionId,
      orgId: position.dados.orgId,
      sectorId: position.dados.sectorId,
      name: position.dados.name,
      code: position.dados.code,
      description: position.dados.description ?? null,
      responsabilidades: position.dados.responsabilidades ?? null,
      requisitos: position.dados.requisitos ?? null,
      salarioMin: position.dados.salarioMin ?? null,
      salarioMax: position.dados.salarioMax ?? null,
      status: position.dados.status,
      ordem: position.dados.ordem,
      metadata: position.dados.metadata ?? null,
      createdBy: position.dados.createdBy,
      updatedBy: position.dados.updatedBy,
      createdAt: position.dados.createdAt,
      updatedAt: position.dados.updatedAt,
    });
  }
}

