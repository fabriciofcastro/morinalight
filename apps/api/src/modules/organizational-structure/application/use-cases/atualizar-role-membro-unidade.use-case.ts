import { z } from "zod";

import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import { organizationRoleSchema } from "../schemas/membership.schema";
import type {
  UnitMembershipRepository,
} from "../../infra/prisma/prisma-unit-membership.repository";

const atualizarRoleMembroUnidadeInputSchema = z.object({
  orgId: z.string().min(1),
  unitId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

type AtualizarRoleMembroUnidadeInput = z.infer<typeof atualizarRoleMembroUnidadeInputSchema>;

type Dependencies = {
  unitMembershipRepository: UnitMembershipRepository;
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarRoleMembroUnidadeUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AtualizarRoleMembroUnidadeInput =
      atualizarRoleMembroUnidadeInputSchema.parse(rawInput);

    // Verificar se a unidade existe
    const unit = await this.deps.organizationalUnitRepository.encontrarPorId(
      input.orgId,
      input.unitId,
    );
    if (!unit) {
      throw new Error("Unidade organizacional não encontrada");
    }

    // Verificar se o membro existe
    const membership = await this.deps.unitMembershipRepository.encontrar(
      input.orgId,
      input.unitId,
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
    const updatedMembership = await this.deps.unitMembershipRepository.atualizarRole(
      input.orgId,
      input.unitId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "unit",
        entityId: input.unitId,
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
        type: "organizational-structure.unit.member-role-updated",
        payload: {
          orgId: input.orgId,
          unitId: input.unitId,
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

