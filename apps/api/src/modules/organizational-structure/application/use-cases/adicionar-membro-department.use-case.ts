import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { UserRepository } from "../../../users/repositories/user.repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { DepartmentMembershipRepository } from "../../infra/prisma/prisma-department-membership.repository";
import {
  type AdicionarMembroDepartamentoInput,
  adicionarMembroDepartamentoInputSchema,
} from "../schemas/membership.schema";

type Dependencies = {
  departmentMembershipRepository: DepartmentMembershipRepository;
  departmentRepository: DepartmentRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AdicionarMembroDepartamentoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input: AdicionarMembroDepartamentoInput =
      adicionarMembroDepartamentoInputSchema.parse(rawInput);

    // Verificar se o departamento existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );
    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se o usuário existe
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se o usuário já é membro
    const existingMembership = await this.deps.departmentMembershipRepository.encontrar(
      input.orgId,
      input.departmentId,
      input.userId,
    );
    if (existingMembership) {
      throw new Error("Usuário já é membro deste departamento");
    }

    // Adicionar membro
    const membership = await this.deps.departmentMembershipRepository.adicionar(
      input.orgId,
      input.departmentId,
      input.userId,
      input.role,
    );

    // Registrar audit log
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "department",
        entityId: input.departmentId,
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
        name: "OrganizationalStructure.DepartmentMemberAdded",
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
          role: input.role,
        },
      });
    }

    return membership;
  }
}
