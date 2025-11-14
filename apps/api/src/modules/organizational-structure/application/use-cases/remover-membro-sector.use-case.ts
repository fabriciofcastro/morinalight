import type { DomainEventBus } from "@morina/shared-kernel";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../../infra/prisma/prisma-sector-membership.repository";
import {
  type RemoverMembroSetorInput,
  removerMembroSetorInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  sectorMembershipRepository: SectorMembershipRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RemoverMembroSetorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: RemoverMembroSetorInput = removerMembroSetorInputSchema.parse(rawInput);

    // Verificar se o setor existe
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);
    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Verificar se o membro existe
    const membership = await this.deps.sectorMembershipRepository.encontrar(
      input.orgId,
      input.sectorId,
      input.userId,
    );
    if (!membership) {
      throw new Error("Membro não encontrado");
    }

    // Remover membro
    await this.deps.sectorMembershipRepository.remover(input.orgId, input.sectorId, input.userId);

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "sector",
        entityId: input.sectorId,
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
        type: "organizational-structure.sector.member-removed",
        payload: {
          orgId: input.orgId,
          sectorId: input.sectorId,
          userId: input.userId,
          actorId: this.deps.actorId,
        },
      });
    }
  }
}

