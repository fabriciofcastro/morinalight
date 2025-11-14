import { z } from "zod";

import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import { organizationRoleSchema } from "../schemas/membership.schema";
import type {
  DepartmentMembershipRepository,
} from "../../infra/prisma/prisma-department-membership.repository";

const atualizarRoleMembroDepartamentoInputSchema = z.object({
  orgId: z.string().min(1),
  departmentId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

type AtualizarRoleMembroDepartamentoInput = z.infer<
  typeof atualizarRoleMembroDepartamentoInputSchema
>;

type Dependencies = {
  departmentMembershipRepository: DepartmentMembershipRepository;
  departmentRepository: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarRoleMembroDepartamentoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AtualizarRoleMembroDepartamentoInput =
      atualizarRoleMembroDepartamentoInputSchema.parse(rawInput);

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

    // Verificar se o role está mudando
    if (membership.role === input.role) {
      return membership;
    }

    const roleAnterior = membership.role;

    // Atualizar role
    const updatedMembership = await this.deps.departmentMembershipRepository.atualizarRole(
      input.orgId,
      input.departmentId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "department",
        entityId: input.departmentId,
        action: "member_role_updated",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          roleAnterior,
          novoRole: input.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.department.member-role-updated",
        payload: {
          orgId: input.orgId,
          departmentId: input.departmentId,
          userId: input.userId,
          roleAnterior,
          novoRole: input.role,
          actorId: this.deps.actorId,
        },
      });
    }

    return updatedMembership;
  }
}

