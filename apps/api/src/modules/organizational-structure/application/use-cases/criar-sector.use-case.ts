import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Sector } from "../../domain/entities/sector";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import { criarSectorInputSchema, sectorViewSchema } from "../schemas/sector.schema";

type Dependencies = {
  sectorRepository: SectorRepository;
  departmentRepository: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarSectorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarSectorInputSchema.parse(rawInput);

    // Verificar se já existe setor com este código
    const sectorExistente = await this.deps.sectorRepository.encontrarPorCode(
      input.orgId,
      input.code,
    );

    if (sectorExistente) {
      throw new Error("Setor com este código já existe");
    }

    // Verificar se departmentId existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId) {
      const parent = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.parentId);

      if (!parent) {
        throw new Error("Setor pai não encontrado");
      }
    }

    const sector = Sector.criar({
      orgId: input.orgId,
      departmentId: input.departmentId,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      metadata: input.metadata ?? null,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.sectorRepository.salvar(sector);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: sector.dados.orgId,
        entityType: "sector",
        entityId: sector.sectorId,
        action: "created",
        actorId: this.deps.actorId,
        payload: {
          name: sector.dados.name,
          code: sector.dados.code,
          departmentId: sector.dados.departmentId,
          parentId: sector.dados.parentId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SectorCreated",
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
          departmentId: sector.dados.departmentId,
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
