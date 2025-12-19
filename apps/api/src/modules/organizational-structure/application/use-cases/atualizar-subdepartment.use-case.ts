import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SubdepartmentRepository } from "../../domain/repositories/subdepartment-repository";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import { atualizarSubdepartmentInputSchema, subdepartmentViewSchema } from "../schemas/subdepartment.schema";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  branchRepository?: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarSubdepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarSubdepartmentInputSchema.parse(rawInput);

    const subdepartment = await this.deps.subdepartmentRepository.encontrarPorId(
      input.orgId,
      input.subdepartmentId,
    );

    if (!subdepartment) {
      throw new Error("Subdepartamento não encontrado");
    }

    // Verificar se novo código já existe (se fornecido e diferente do atual)
    if (input.code !== undefined && input.code !== subdepartment.dados.code) {
      const subdepartmentExistente = await this.deps.subdepartmentRepository.encontrarPorCode(
        input.orgId,
        input.code,
      );

      if (subdepartmentExistente) {
        throw new Error("Subdepartamento com este código já existe");
      }
    }

    // Verificar se branchId existe (se fornecido)
    if (input.branchId !== undefined && input.branchId !== null && this.deps.branchRepository) {
      const branch = await this.deps.branchRepository.encontrarPorId(
        input.orgId,
        input.branchId,
      );

      if (!branch) {
        throw new Error("Filial não encontrada");
      }
    }

    // Verificar se parentId existe (se fornecido)
    if (input.parentId !== undefined && input.parentId !== null) {
      const parent = await this.deps.subdepartmentRepository.encontrarPorId(
        input.orgId,
        input.parentId,
      );

      if (!parent) {
        throw new Error("Subdepartamento pai não encontrado");
      }

      // Evitar referência circular
      if (input.parentId === subdepartment.subdepartmentId) {
        throw new Error("Subdepartamento não pode ser pai de si mesmo");
      }
    }

    subdepartment.atualizarDados(
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

    await this.deps.subdepartmentRepository.salvar(subdepartment);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: subdepartment.dados.orgId,
        entityType: "subdepartment",
        entityId: subdepartment.subdepartmentId,
        action: "updated",
        actorId: this.deps.actorId,
        payload: {
          name: subdepartment.dados.name,
          code: subdepartment.dados.code,
          status: subdepartment.dados.status,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SubdepartmentUpdated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: subdepartment.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          subdepartmentId: subdepartment.subdepartmentId,
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

