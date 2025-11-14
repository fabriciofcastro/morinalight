import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";

import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../../infra/prisma/prisma-sector-membership.repository";
import { organizationRoleSchema } from "../schemas/membership.schema";

const atualizarRoleMembroSetorInputSchema = z.object({
  orgId: z.string().min(1),
  sectorId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

type AtualizarRoleMembroSetorInput = z.infer<typeof atualizarRoleMembroSetorInputSchema>;

type Dependencies = {
  sectorMembershipRepository: SectorMembershipRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarRoleMembroSetorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AtualizarRoleMembroSetorInput =
      atualizarRoleMembroSetorInputSchema.parse(rawInput);

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

    // Verificar se o role está mudando
    if (membership.role === input.role) {
      return membership;
    }

    const roleAnterior = membership.role;

    // Atualizar role
    const updatedMembership = await this.deps.sectorMembershipRepository.atualizarRole(
      input.orgId,
      input.sectorId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        orgId: input.orgId,
        entityType: "sector",
        entityId: input.sectorId,
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
        type: "organizational-structure.sector.member-role-updated",
        payload: {
          orgId: input.orgId,
          sectorId: input.sectorId,
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

