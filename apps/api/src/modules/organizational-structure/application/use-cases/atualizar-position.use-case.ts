import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import { atualizarPositionInputSchema, positionViewSchema } from "../schemas/position.schema";

type Dependencies = {
  positionRepository: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarPositionUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarPositionInputSchema.parse(rawInput);

    // Encontrar cargo existente
    const position = await this.deps.positionRepository.encontrarPorId(
      input.orgId,
      input.positionId,
    );

    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Verificar se código já existe em outro cargo (se alterado)
    if (input.code && input.code !== position.dados.code) {
      const positionComCode = await this.deps.positionRepository.encontrarPorCode(
        input.orgId,
        input.code,
      );

      if (positionComCode && positionComCode.positionId !== position.positionId) {
        throw new Error("Cargo com este código já existe");
      }
    }

    // Validar faixa salarial
    const salarioMin = input.salarioMin ?? position.dados.salarioMin;
    const salarioMax = input.salarioMax ?? position.dados.salarioMax;

    if (salarioMin && salarioMax && salarioMin > salarioMax) {
      throw new Error("Salário mínimo não pode ser maior que salário máximo");
    }

    // Atualizar dados
    position.atualizarDados(
      {
        name: input.name,
        code: input.code,
        description: input.description,
        responsabilidades: input.responsabilidades,
        requisitos: input.requisitos,
        salarioMin: input.salarioMin,
        salarioMax: input.salarioMax,
        status: input.status,
        ordem: input.ordem,
        metadata: input.metadata,
      },
      this.deps.actorId,
    );

    await this.deps.positionRepository.salvar(position);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: position.dados.orgId,
        entityType: "position",
        entityId: position.positionId,
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
        name: "OrganizationalStructure.PositionUpdated",
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
