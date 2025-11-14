import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { DomainEventBus } from "@morina/shared-kernel";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import { registerOrganizationalStructureHttpRoutes } from "./http";
import { PrismaDepartmentRepository } from "./infra/prisma/prisma-department.repository";
import { PrismaSectorRepository } from "./infra/prisma/prisma-sector.repository";
import { PrismaPositionRepository } from "./infra/prisma/prisma-position.repository";
import { PrismaOrganizationalStructureAuditLogRepository } from "./infra/prisma/prisma-organizational-structure-audit-log.repository";
import type {
  DepartmentRepository,
  SectorRepository,
  PositionRepository,
  OrganizationalStructureAuditLogRepository,
} from "./domain/repositories";
import { PrismaPositionMembershipRepository } from "./infra/prisma/prisma-position-membership.repository";
import type { PositionMembershipRepository } from "./infra/prisma/prisma-position-membership.repository";
import { PrismaDepartmentMembershipRepository } from "./infra/prisma/prisma-department-membership.repository";
import type { DepartmentMembershipRepository } from "./infra/prisma/prisma-department-membership.repository";

export type OrganizationalStructureModuleOptions = {
  departmentRepository?: DepartmentRepository;
  sectorRepository?: SectorRepository;
  positionRepository?: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  organizationRepository?: OrganizationRepository;
  eventBus?: DomainEventBus;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
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
    (process.env.DATABASE_URL
      ? new PrismaOrganizationalStructureAuditLogRepository()
      : undefined);

  const positionMembershipRepository =
    options.positionMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaPositionMembershipRepository() : undefined);

  const departmentMembershipRepository =
    options.departmentMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentMembershipRepository() : undefined);

  // Aplicar hook de tenant nas rotas de estrutura organizacional
  if (options.organizationRepository && departmentRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: ["/departments", "/sectors", "/positions"],
    });
  }

  // Registrar rotas HTTP
  if (departmentRepository && sectorRepository && positionRepository) {
    await registerOrganizationalStructureHttpRoutes(app, {
      departmentRepository,
      sectorRepository,
      positionRepository,
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
  };
}

