import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import type { UserRepository } from "../../../users/repositories/user.repository";
import {
  adicionarMembroUnidadeInputSchema,
  type AdicionarMembroUnidadeInput,
} from "../schemas/membership.schema";
import type {
  UnitMembershipRepository,
} from "../../infra/prisma/prisma-unit-membership.repository";

type Dependencies = {
  unitMembershipRepository: UnitMembershipRepository;
  organizationalUnitRepository: OrganizationalUnitRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AdicionarMembroUnidadeUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AdicionarMembroUnidadeInput = adicionarMembroUnidadeInputSchema.parse(rawInput);

    // Verificar se a unidade existe
    const unit = await this.deps.organizationalUnitRepository.encontrarPorId(
      input.orgId,
      input.unitId,
    );
    if (!unit) {
      throw new Error("Unidade organizacional não encontrada");
    }

    // Verificar se o usuário existe
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro
    const existingMembership = await this.deps.unitMembershipRepository.encontrar(
      input.orgId,
      input.unitId,
      input.userId,
    );
    if (existingMembership) {
      throw new Error("Usuário já é membro desta unidade");
    }

    // Adicionar membro
    const membership = await this.deps.unitMembershipRepository.adicionar(
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
        action: "member_added",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: input.role,
        },
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "organizational-structure.unit.member-added",
        payload: {
          orgId: input.orgId,
          unitId: input.unitId,
          userId: input.userId,
          role: input.role,
          actorId: this.deps.actorId,
        },
      });
    }

    return membership;
  }
}

