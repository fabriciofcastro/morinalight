import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { BranchRepository } from "../../domain/repositories/branch-repository";

type Dependencies = {
  branchRepository: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

const inputSchema = z.object({
  orgId: z.string().min(1),
  branchId: z.string().uuid(),
});

export class DeletarBranchUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = inputSchema.parse(rawInput);

    const branch = await this.deps.branchRepository.findById(input.branchId);

    if (!branch || branch.dados.orgId !== input.orgId) {
      throw new Error("Filial não encontrada");
    }

    // Desativar ao invés de deletar fisicamente para manter histórico
    branch.desativar();
    await this.deps.branchRepository.save(branch);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: branch.dados.orgId,
        entityType: "branch",
        entityId: branch.branchId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: branch.dados.name,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.BranchDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: branch.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          branchId: branch.branchId,
        },
      });
    }
  }
}
