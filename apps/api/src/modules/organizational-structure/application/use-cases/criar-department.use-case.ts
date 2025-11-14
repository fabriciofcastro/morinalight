import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Department } from "../../domain/entities/department";
import { criarDepartmentInputSchema, departmentViewSchema } from "../schemas/department.schema";
import { randomUUID } from "crypto";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  organizationalUnitRepository?: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarDepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarDepartmentInputSchema.parse(rawInput);

    // Verificar se já existe departamento com este código
    const departmentExistente = await this.deps.departmentRepository.encontrarPorCode(
      input.orgId,
      input.code,
    );

    if (departmentExistente) {
      throw new Error("Departamento com este código já existe");
    }

    // Verificar se unitId existe (se fornecido)
    if (input.unitId && this.deps.organizationalUnitRepository) {
      const unit = await this.deps.organizationalUnitRepository.encontrarPorId(
        input.orgId,
        input.unitId,
      );

      if (!unit) {
        throw new Error("Unidade organizacional não encontrada");
      }
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId) {
      const parent = await this.deps.departmentRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Departamento pai não encontrado");
      }
    }

    const department = Department.criar({
      orgId: input.orgId,
      unitId: input.unitId ?? null,
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

    await this.deps.departmentRepository.salvar(department);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: department.dados.orgId,
        entityType: "department",
        entityId: department.departmentId,
        action: "created",
        actorId: this.deps.actorId,
        payload: {
          name: department.dados.name,
          code: department.dados.code,
          unitId: department.dados.unitId,
          parentId: department.dados.parentId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.DepartmentCreated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: department.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          departmentId: department.departmentId,
          name: department.dados.name,
          code: department.dados.code,
          status: department.dados.status,
        },
      });
    }

    return departmentViewSchema.parse({
      departmentId: department.departmentId,
      orgId: department.dados.orgId,
      unitId: department.dados.unitId ?? null,
      name: department.dados.name,
      code: department.dados.code,
      description: department.dados.description ?? null,
      parentId: department.dados.parentId ?? null,
      status: department.dados.status,
      ordem: department.dados.ordem,
      metadata: department.dados.metadata ?? null,
      createdBy: department.dados.createdBy,
      updatedBy: department.dados.updatedBy,
      createdAt: department.dados.createdAt,
      updatedAt: department.dados.updatedAt,
    });
  }
}

