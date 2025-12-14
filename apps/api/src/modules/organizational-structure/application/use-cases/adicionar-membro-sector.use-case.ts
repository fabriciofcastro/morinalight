import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { UserRepository } from "../../../users/repositories/user.repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { SectorRepository } from "../../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../../infra/prisma/prisma-sector-membership.repository";
import {
  type AdicionarMembroSetorInput,
  adicionarMembroSetorInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  sectorMembershipRepository: SectorMembershipRepository;
  sectorRepository: SectorRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AdicionarMembroSetorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AdicionarMembroSetorInput = adicionarMembroSetorInputSchema.parse(rawInput);

    // Verificar se o setor existe
    const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.sectorId);
    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Verificar se o usuário existe
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro
    const existingMembership = await this.deps.sectorMembershipRepository.encontrar(
      input.orgId,
      input.sectorId,
      input.userId,
    );
    if (existingMembership) {
      throw new Error("Usuário já é membro deste setor");
    }

    // Adicionar membro
    const membership = await this.deps.sectorMembershipRepository.adicionar(
      input.orgId,
      input.sectorId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "sector",
        entityId: input.sectorId,
        action: "member_added",
        actorId: this.deps.actorId,
        payload: {
          userId: input.userId,
          role: input.role,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.SectorMemberAdded",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          sectorId: input.sectorId,
          userId: input.userId,
          role: input.role,
        },
      });
    }

    return membership;
  }
}
