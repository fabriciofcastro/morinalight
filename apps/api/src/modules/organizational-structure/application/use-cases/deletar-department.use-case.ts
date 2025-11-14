import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import { randomUUID } from "crypto";

const deletarDepartmentInputSchema = z.object({
  orgId: z.string().min(1),
  departmentId: z.string().uuid(),
});

type Dependencies = {
  departmentRepository: DepartmentRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarDepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarDepartmentInputSchema.parse(rawInput);

    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se há departamentos filhas
    const departmentsFilhos = await this.deps.departmentRepository.listarPorOrg(input.orgId, {
      parentId: input.departmentId,
      limite: 1,
    });

    if (departmentsFilhos.itens.length > 0) {
      throw new Error("Não é possível deletar departamento com departamentos filhos. Remova ou mova os departamentos filhos primeiro.");
    }

    // Verificar se há setores associados
    const sectors = await this.deps.sectorRepository.listarPorOrg(input.orgId, {
      departmentId: input.departmentId,
      limite: 1,
    });

    if (sectors.itens.length > 0) {
      throw new Error("Não é possível deletar departamento com setores associados. Remova ou mova os setores primeiro.");
    }

    await this.deps.departmentRepository.deletar(input.orgId, input.departmentId);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: department.dados.orgId,
        entityType: "department",
        entityId: department.departmentId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: department.dados.name,
          code: department.dados.code,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.DepartmentDeleted",
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
        },
      });
    }

    return { success: true };
  }
}

