import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Department } from "../../domain/entities/department";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import {
  calculateHierarchyDepth,
  wouldExceedMaxDepth,
} from "../../domain/utils/hierarchy-validator";
import { criarDepartmentInputSchema, departmentViewSchema } from "../schemas/department.schema";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  branchRepository?: BranchRepository;
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

    // Verificar se branchId existe (se fornecido)
    if (input.branchId && this.deps.branchRepository) {
      const branch = await this.deps.branchRepository.encontrarPorId(input.orgId, input.branchId);

      if (!branch) {
        throw new Error("Filial não encontrada");
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

      // Verificar profundidade máxima
      const parentDepth = await calculateHierarchyDepth(input.parentId, async (id: string) => {
        const dept = await this.deps.departmentRepository.encontrarPorId(input.orgId, id);
        return dept
          ? ({ id: dept.departmentId, parentId: dept.dados.parentId } as Department)
          : null;
      });

      if (parentDepth >= 9) {
        throw new Error("Profundidade máxima da hierarquia seria excedida. Limite: 10 níveis.");
      }
    }

    const department = Department.criar({
      orgId: input.orgId,
      branchId: input.branchId ?? null,
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
          branchId: department.dados.branchId,
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
      branchId: department.dados.branchId ?? null,
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
