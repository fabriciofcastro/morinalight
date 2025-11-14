import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type {
  DepartmentRepository,
  OrganizationalStructureAuditLogRepository,
  PositionRepository,
  SectorRepository,
} from "./domain/repositories";
import { registerOrganizationalStructureHttpRoutes } from "./http";
import { PrismaDepartmentRepository } from "./infra/prisma/prisma-department.repository";
import type { DepartmentMembershipRepository } from "./infra/prisma/prisma-department-membership.repository";
import { PrismaDepartmentMembershipRepository } from "./infra/prisma/prisma-department-membership.repository";
import { PrismaOrganizationalStructureAuditLogRepository } from "./infra/prisma/prisma-organizational-structure-audit-log.repository";
import { PrismaPositionRepository } from "./infra/prisma/prisma-position.repository";
import type { PositionMembershipRepository } from "./infra/prisma/prisma-position-membership.repository";
import { PrismaPositionMembershipRepository } from "./infra/prisma/prisma-position-membership.repository";
import { PrismaSectorRepository } from "./infra/prisma/prisma-sector.repository";
import type { SectorMembershipRepository } from "./infra/prisma/prisma-sector-membership.repository";
import { PrismaSectorMembershipRepository } from "./infra/prisma/prisma-sector-membership.repository";
import type { UserRepository } from "../users/repositories/user.repository";
import { registerDepartmentMembersRoutes } from "./http/department-members.routes";
import { registerPositionMembersRoutes } from "./http/position-members.routes";
import { registerSectorMembersRoutes } from "./http/sector-members.routes";

export type OrganizationalStructureModuleOptions = {
  departmentRepository?: DepartmentRepository;
  sectorRepository?: SectorRepository;
  positionRepository?: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  organizationRepository?: OrganizationRepository;
  eventBus?: DomainEventBus;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  sectorMembershipRepository?: SectorMembershipRepository;
  userRepository?: UserRepository;
};

export async function registerOrganizationalStructureModule(
  app: FastifyInstance,
  options: OrganizationalStructureModuleOptions = {},
) {
  const departmentRepository =
    options.departmentRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentRepository() : undefined);

  const sectorRepository =
    options.sectorRepository ??
    (process.env.DATABASE_URL ? new PrismaSectorRepository() : undefined);

  const positionRepository =
    options.positionRepository ??
    (process.env.DATABASE_URL ? new PrismaPositionRepository() : undefined);

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({
          url: env.REDIS_URL,
          realtimeStream: "realtime.organizational-structure",
        })
      : undefined);

  const auditLogRepository =
    options.auditLogRepository ??
    (process.env.DATABASE_URL ? new PrismaOrganizationalStructureAuditLogRepository() : undefined);

  const positionMembershipRepository =
    options.positionMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaPositionMembershipRepository() : undefined);

  const departmentMembershipRepository =
    options.departmentMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentMembershipRepository() : undefined);

  const sectorMembershipRepository =
    options.sectorMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaSectorMembershipRepository() : undefined);

  // Registrar rotas de membros se tivermos todos os repositórios necessários
  if (
    departmentMembershipRepository &&
    sectorMembershipRepository &&
    positionMembershipRepository &&
    departmentRepository &&
    sectorRepository &&
    positionRepository &&
    options.userRepository
  ) {
    // Registrar rotas de membros de departamentos
    await registerDepartmentMembersRoutes(app, {
      departmentMembershipRepository,
      departmentRepository,
      userRepository: options.userRepository,
      auditLogRepository,
      eventBus,
    });

    // Registrar rotas de membros de setores
    await registerSectorMembersRoutes(app, {
      sectorMembershipRepository,
      sectorRepository,
      userRepository: options.userRepository,
      auditLogRepository,
      eventBus,
    });

    // Registrar rotas de membros de cargos
    await registerPositionMembersRoutes(app, {
      positionMembershipRepository,
      positionRepository,
      userRepository: options.userRepository,
      auditLogRepository,
      eventBus,
    });
  }

  // Aplicar hook de tenant nas rotas de estrutura organizacional
  if (options.organizationRepository && departmentRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: [
        "/departments",
        "/sectors",
        "/positions",
        "/departments/:departmentId/members",
        "/sectors/:sectorId/members",
        "/positions/:positionId/members",
      ],
    });
  }

  // Registrar rotas HTTP
  if (departmentRepository && sectorRepository && positionRepository) {
    await registerOrganizationalStructureHttpRoutes(app, {
      departmentRepository,
      sectorRepository,
      positionRepository,
      departmentMembershipRepository,
      sectorMembershipRepository,
      positionMembershipRepository,
      auditLogRepository,
      eventBus,
    });
  }

  app.log.info("Módulo Estrutura Organizacional registrado");

  return {
    departmentRepository,
    sectorRepository,
    positionRepository,
    auditLogRepository,
    eventBus,
    positionMembershipRepository,
    departmentMembershipRepository,
    sectorMembershipRepository,
  };
}
