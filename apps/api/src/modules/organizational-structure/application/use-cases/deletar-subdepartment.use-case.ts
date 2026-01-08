import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { SubdepartmentRepository } from "../../domain/repositories/subdepartment-repository";

const deletarSubdepartmentInputSchema = z.object({
  orgId: z.string().min(1),
  subdepartmentId: z.string().uuid(),
});

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarSubdepartmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarSubdepartmentInputSchema.parse(rawInput);

    const subdepartment = await this.deps.subdepartmentRepository.encontrarPorId(
      input.orgId,
      input.subdepartmentId,
    );

    if (!subdepartment) {
      throw new Error("Subdepartamento não encontrado");
    }

    // Verificar se há subdepartamentos filhas
    const subdepartmentsFilhos = await this.deps.subdepartmentRepository.listarPorOrg(input.orgId, {
      parentId: input.subdepartmentId,
      limite: 1,
    });

    if (subdepartmentsFilhos.itens.length > 0) {
      throw new Error(
        "Não é possível deletar subdepartamento com subdepartamentos filhos. Remova ou mova os subdepartamentos filhos primeiro.",
      );
    }

    // Verificar se há setores associados
    const sectors = await this.deps.sectorRepository.listarPorOrg(input.orgId, {
      subdepartmentId: input.subdepartmentId,
      limite: 1,
    });

    if (sectors.itens.length > 0) {
      throw new Error(
        "Não é possível deletar subdepartamento com setores associados. Remova ou mova os setores primeiro.",
      );
    }

    // Arquivar ao invés de deletar fisicamente para manter histórico
    subdepartment.arquivar(this.deps.actorId);
    await this.deps.subdepartmentRepository.salvar(subdepartment);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: subdepartment.dados.orgId,
        entityType: "subdepartment",
        entityId: subdepartment.subdepartmentId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: subdepartment.dados.name,
          code: subdepartment.dados.code,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SubdepartmentDeleted",
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
        },
      });
    }

    return { success: true };
  }
}
