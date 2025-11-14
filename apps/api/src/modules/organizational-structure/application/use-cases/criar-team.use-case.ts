import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Team } from "../../domain/entities/team";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { DepartmentRepository } from "../../domain/repositories/department-repository";
import type { TeamRepository } from "../../domain/repositories/team-repository";
import { criarTeamInputSchema, teamViewSchema } from "../schemas/team.schema";

type Dependencies = {
  teamRepository: TeamRepository;
  departmentRepository?: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarTeamUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarTeamInputSchema.parse(rawInput);

    // Verificar se já existe team com este código
    const teamExistente = await this.deps.teamRepository.encontrarPorCode(input.orgId, input.code);

    if (teamExistente) {
      throw new Error("Time com este código já existe");
    }

    // Verificar se departmentId existe (se fornecido)
    if (input.departmentId && this.deps.departmentRepository) {
      const department = await this.deps.departmentRepository.encontrarPorId(
        input.orgId,
        input.departmentId,
      );

      if (!department) {
        throw new Error("Departamento não encontrado");
      }
    }

    const team = Team.criar({
      orgId: input.orgId,
      departmentId: input.departmentId ?? null,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      status: input.status ?? "ativo",
      ordem: input.ordem ?? 0,
      metadata: input.metadata ?? null,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.teamRepository.salvar(team);

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: team.dados.orgId,
        entityType: "team",
        entityId: team.teamId,
        action: "created",
        actorId: this.deps.actorId,
        payload: {
          name: team.dados.name,
          code: team.dados.code,
          departmentId: team.dados.departmentId,
        },
        createdAt: new Date(),
      });
    }

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.TeamCreated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: team.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          teamId: team.teamId,
          name: team.dados.name,
          code: team.dados.code,
          status: team.dados.status,
        },
      });
    }

    return teamViewSchema.parse({
      teamId: team.teamId,
      orgId: team.dados.orgId,
      departmentId: team.dados.departmentId ?? null,
      name: team.dados.name,
      code: team.dados.code,
      description: team.dados.description ?? null,
      status: team.dados.status,
      ordem: team.dados.ordem,
      metadata: team.dados.metadata ?? null,
      createdBy: team.dados.createdBy,
      updatedBy: team.dados.updatedBy,
      createdAt: team.dados.createdAt,
      updatedAt: team.dados.updatedAt,
    });
  }
}
