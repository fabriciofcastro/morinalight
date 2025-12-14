import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { UserRepository } from "../../../users/repositories/user.repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { PositionRepository } from "../../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../../infra/prisma/prisma-position-membership.repository";
import {
  type AdicionarMembroCargoInput,
  adicionarMembroCargoInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  positionMembershipRepository: PositionMembershipRepository;
  positionRepository: PositionRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AdicionarMembroCargoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AdicionarMembroCargoInput = adicionarMembroCargoInputSchema.parse(rawInput);

    // Verificar se o cargo existe
    const position = await this.deps.positionRepository.encontrarPorId(
      input.orgId,
      input.positionId,
    );
    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Verificar se o usuário existe
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro
    const existingMembership = await this.deps.positionMembershipRepository.encontrar(
      input.orgId,
      input.positionId,
      input.userId,
    );
    if (existingMembership) {
      throw new Error("Usuário já é membro deste cargo");
    }

    // Adicionar membro
    const membership = await this.deps.positionMembershipRepository.adicionar(
      input.orgId,
      input.positionId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "position",
        entityId: input.positionId,
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
        name: "OrganizationalStructure.PositionMemberAdded",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          positionId: input.positionId,
          userId: input.userId,
          role: input.role,
        },
      });
    }

    return membership;
  }
}
