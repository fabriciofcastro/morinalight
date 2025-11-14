import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import {
  removerMembroDepartamentoInputSchema,
  type RemoverMembroDepartamentoInput,
} from "../schemas/membership.schema";
import type {
  DepartmentMembershipRepository,
} from "../../infra/prisma/prisma-department-membership.repository";

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
        orgId: input.orgId,
        entityType: "department",
        entityId: input.departmentId,
        action: "member_removed",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: membership.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.department.member-removed",
        payload: {
          orgId: input.orgId,
          departmentId: input.departmentId,
          userId: input.userId,
          actorId: this.deps.actorId,
        },
      });
    }
  }
}

