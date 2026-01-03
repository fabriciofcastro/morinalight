import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { DepartmentMembershipRepository } from "../../infra/prisma/prisma-department-membership.repository";
import {
  type RemoverMembroDepartamentoInput,
  removerMembroDepartamentoInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  departmentMembershipRepository: DepartmentMembershipRepository;
  departmentRepository: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RemoverMembroDepartamentoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: RemoverMembroDepartamentoInput =
      removerMembroDepartamentoInputSchema.parse(rawInput);

    // Verificar se o departamento existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );
    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se o membro existe
    const membership = await this.deps.departmentMembershipRepository.encontrar(
      input.orgId,
      input.departmentId,
      input.userId,
    );
    if (!membership) {
      throw new Error("Membro não encontrado");
    }

    // Remover membro
    await this.deps.departmentMembershipRepository.remover(
      input.orgId,
      input.departmentId,
      input.userId,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "department",
        entityId: input.departmentId,
        action: "member_removed",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: membership.role,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.DepartmentMemberRemoved",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          departmentId: input.departmentId,
          userId: input.userId,
        },
      });
    }
  }
}
