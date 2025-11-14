import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import {
  removerMembroUnidadeInputSchema,
  type RemoverMembroUnidadeInput,
} from "../schemas/membership.schema";
import type {
  UnitMembershipRepository,
} from "../../infra/prisma/prisma-unit-membership.repository";

type Dependencies = {
  unitMembershipRepository: UnitMembershipRepository;
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RemoverMembroUnidadeUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: RemoverMembroUnidadeInput = removerMembroUnidadeInputSchema.parse(rawInput);

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

    // Remover membro
    await this.deps.unitMembershipRepository.remover(input.orgId, input.unitId, input.userId);

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "unit",
        entityId: input.unitId,
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
        type: "organizational-structure.unit.member-removed",
        payload: {
          orgId: input.orgId,
          unitId: input.unitId,
          userId: input.userId,
          actorId: this.deps.actorId,
        },
      });
    }
  }
}

