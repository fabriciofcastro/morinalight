import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Subdepartment } from "../../domain/entities/subdepartment";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SubdepartmentRepository } from "../../domain/repositories/subdepartment-repository";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import { criarSubdepartmentInputSchema, subdepartmentViewSchema } from "../schemas/subdepartment.schema";
import { calculateHierarchyDepth } from "../../domain/utils/hierarchy-validator";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  departmentRepository: DepartmentRepository;
  branchRepository?: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarSubdepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarSubdepartmentInputSchema.parse(rawInput);

    // Verificar se já existe subdepartamento com este código
    const subdepartmentExistente = await this.deps.subdepartmentRepository.encontrarPorCode(
      input.orgId,
      input.code,
    );

    if (subdepartmentExistente) {
      throw new Error("Subdepartamento com este código já existe");
    }

    // Verificar se departmentId existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se branchId existe (se fornecido)
    if (input.branchId && this.deps.branchRepository) {
      const branch = await this.deps.branchRepository.encontrarPorId(
        input.orgId,
        input.branchId,
      );

      if (!branch) {
        throw new Error("Filial não encontrada");
      }
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId) {
      const parent = await this.deps.subdepartmentRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Subdepartamento pai não encontrado");
      }

      // Verificar profundidade máxima
      const parentDepth = await calculateHierarchyDepth(
        input.parentId,
        async (id: string) => {
          const subdept = await this.deps.subdepartmentRepository.encontrarPorId(input.orgId, id);
          return subdept ? ({ id: subdept.subdepartmentId, parentId: subdept.dados.parentId } as Subdepartment) : null;
        },
      );

      if (parentDepth >= 9) {
        throw new Error("Profundidade máxima da hierarquia seria excedida. Limite: 10 níveis.");
      }
    }

    const subdepartment = Subdepartment.criar({
      orgId: input.orgId,
      branchId: input.branchId ?? null,
      departmentId: input.departmentId,
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

    await this.deps.subdepartmentRepository.salvar(subdepartment);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: subdepartment.dados.orgId,
        entityType: "subdepartment",
        entityId: subdepartment.subdepartmentId,
        action: "created",
        actorId: this.deps.actorId,
        payload: {
          name: subdepartment.dados.name,
          code: subdepartment.dados.code,
          departmentId: subdepartment.dados.departmentId,
          branchId: subdepartment.dados.branchId,
          parentId: subdepartment.dados.parentId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SubdepartmentCreated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: subdepartment.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          subdepartmentId: subdepartment.subdepartmentId,
          departmentId: subdepartment.dados.departmentId,
          name: subdepartment.dados.name,
          code: subdepartment.dados.code,
          status: subdepartment.dados.status,
        },
      });
    }

    return subdepartmentViewSchema.parse({
      subdepartmentId: subdepartment.subdepartmentId,
      orgId: subdepartment.dados.orgId,
      branchId: subdepartment.dados.branchId ?? null,
      departmentId: subdepartment.dados.departmentId,
      name: subdepartment.dados.name,
      code: subdepartment.dados.code,
      description: subdepartment.dados.description ?? null,
      parentId: subdepartment.dados.parentId ?? null,
      status: subdepartment.dados.status,
      ordem: subdepartment.dados.ordem,
      metadata: subdepartment.dados.metadata ?? null,
      createdBy: subdepartment.dados.createdBy,
      updatedBy: subdepartment.dados.updatedBy,
      createdAt: subdepartment.dados.createdAt,
      updatedAt: subdepartment.dados.updatedAt,
    });
  }
}

