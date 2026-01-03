import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import { atualizarBranchInputSchema, branchViewSchema } from "../schemas/branch.schema";

type Dependencies = {
  branchRepository: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarBranchUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarBranchInputSchema.parse(rawInput);

    const branch = await this.deps.branchRepository.findById(input.branchId);

    if (!branch || branch.dados.orgId !== input.orgId) {
      throw new Error("Filial não encontrada");
    }

    branch.atualizarDados({
      name: input.name,
      type: input.type,
      internalCode: input.internalCode,
      cnpj: input.cnpj,
      stateRegistration: input.stateRegistration,
      address: input.address,
      phone: input.phone,
      email: input.email,
      active: input.active,
    });

    await this.deps.branchRepository.save(branch);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: branch.dados.orgId,
        entityType: "branch",
        entityId: branch.branchId,
        action: "updated",
        actorId: this.deps.actorId,
        payload: {
          input,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.BranchUpdated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: branch.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          branchId: branch.branchId,
          name: branch.dados.name,
          active: branch.dados.active,
        },
      });
    }

    return branchViewSchema.parse({
      branchId: branch.branchId,
      orgId: branch.dados.orgId,
      name: branch.dados.name,
      type: branch.dados.type,
      internalCode: branch.dados.internalCode ?? null,
      cnpj: branch.dados.cnpj ?? null,
      stateRegistration: branch.dados.stateRegistration ?? null,
      address: branch.dados.address ?? null,
      phone: branch.dados.phone ?? null,
      email: branch.dados.email ?? null,
      active: branch.dados.active,
      createdAt: branch.dados.createdAt,
      updatedAt: branch.dados.updatedAt,
    });
  }
}
