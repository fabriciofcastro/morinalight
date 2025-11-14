import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import type {
  UnitMembershipRepository,
} from "../../infra/prisma/prisma-unit-membership.repository";
import { z } from "zod";
import { randomUUID } from "crypto";

const deletarOrganizationalUnitInputSchema = z.object({
  orgId: z.string().min(1),
  unitId: z.string().uuid(),
});

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  departmentRepository: DepartmentRepository;
  unitMembershipRepository?: UnitMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class DeletarOrganizationalUnitUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = deletarOrganizationalUnitInputSchema.parse(rawInput);

    const unit = await this.deps.organizationalUnitRepository.encontrarPorId(
      input.orgId,
      input.unitId,
    );

    if (!unit) {
      throw new Error("Unidade organizacional não encontrada");
    }

    // Verificar se há unidades filhas
    const unidadesFilhas = await this.deps.organizationalUnitRepository.listarPorOrg(input.orgId, {
      parentId: input.unitId,
      limite: 1,
    });

    if (unidadesFilhas.itens.length > 0) {
      throw new Error("Não é possível deletar unidade com unidades filhas. Remova ou mova as unidades filhas primeiro.");
    }

    // Verificar se há departamentos associados
    const departments = await this.deps.departmentRepository.listarPorOrg(input.orgId, {
      unitId: input.unitId,
      limite: 1,
    });

    if (departments.itens.length > 0) {
      throw new Error("Não é possível deletar unidade com departamentos associados. Remova ou mova os departamentos primeiro.");
    }

    // Verificar se há membros
    if (this.deps.unitMembershipRepository) {
      const memberCount = await this.deps.unitMembershipRepository.contarPorUnit(
        input.orgId,
        input.unitId,
      );

      if (memberCount > 0) {
        throw new Error("Não é possível deletar unidade com membros. Remova todos os membros primeiro.");
      }
    }

    await this.deps.organizationalUnitRepository.deletar(input.orgId, input.unitId);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: unit.dados.orgId,
        entityType: "unit",
        entityId: unit.unitId,
        action: "deleted",
        actorId: this.deps.actorId,
        payload: {
          name: unit.dados.name,
          code: unit.dados.code,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.UnitDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: unit.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          unitId: unit.unitId,
          name: unit.dados.name,
          code: unit.dados.code,
        },
      });
    }

    return { success: true };
  }
}

