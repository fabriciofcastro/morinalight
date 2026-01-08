import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { Department } from "../../domain/entities/department";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import {
  calculateHierarchyDepth,
  hasHierarchyLoop,
  wouldExceedMaxDepth,
} from "../../domain/utils/hierarchy-validator";
import { atualizarDepartmentInputSchema, departmentViewSchema } from "../schemas/department.schema";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  branchRepository?: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarDepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarDepartmentInputSchema.parse(rawInput);

    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se novo código já existe (se fornecido e diferente do atual)
    if (input.code !== undefined && input.code !== department.dados.code) {
      const departmentExistente = await this.deps.departmentRepository.encontrarPorCode(
        input.orgId,
        input.code,
      );

      if (departmentExistente) {
        throw new Error("Departamento com este código já existe");
      }
    }

    // Verificar se branchId existe (se fornecido)
    if (input.branchId !== undefined && input.branchId !== null && this.deps.branchRepository) {
      const branch = await this.deps.branchRepository.encontrarPorId(input.orgId, input.branchId);

      if (!branch) {
        throw new Error("Filial não encontrada");
      }
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId !== undefined && input.parentId !== null) {
      const parent = await this.deps.departmentRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Departamento pai não encontrado");
      }

      // Evitar referência circular e loops hierárquicos
      if (input.parentId === department.departmentId) {
        throw new Error("Departamento não pode ser pai de si mesmo");
      }

      // Verificar loops hierárquicos (se o parentId é descendente do department atual)
      const hasLoop = await hasHierarchyLoop(
        department.departmentId,
        input.parentId,
        async (id: string) => {
          const dept = await this.deps.departmentRepository.encontrarPorId(input.orgId, id);
          return dept
            ? ({ id: dept.departmentId, parentId: dept.dados.parentId } as Department)
            : null;
        },
      );

      if (hasLoop) {
        throw new Error(
          "Não é possível criar hierarquia circular. O departamento pai é descendente deste departamento.",
        );
      }

      // Verificar profundidade máxima
      const currentDepth = await calculateHierarchyDepth(
        department.departmentId,
        async (id: string) => {
          const dept = await this.deps.departmentRepository.encontrarPorId(input.orgId, id);
          return dept
            ? ({ id: dept.departmentId, parentId: dept.dados.parentId } as Department)
            : null;
        },
      );

      const wouldExceed = await wouldExceedMaxDepth(
        currentDepth,
        input.parentId,
        async (id: string) => {
          const dept = await this.deps.departmentRepository.encontrarPorId(input.orgId, id);
          return dept
            ? ({ id: dept.departmentId, parentId: dept.dados.parentId } as Department)
            : null;
        },
      );

      if (wouldExceed) {
        throw new Error("Profundidade máxima da hierarquia seria excedida. Limite: 10 níveis.");
      }
    }

    department.atualizarDados(
      {
        branchId: input.branchId,
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

    await this.deps.departmentRepository.salvar(department);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: department.dados.orgId,
        entityType: "department",
        entityId: department.departmentId,
        action: "updated",
        actorId: this.deps.actorId,
        payload: {
          name: department.dados.name,
          code: department.dados.code,
          status: department.dados.status,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.DepartmentUpdated",
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
