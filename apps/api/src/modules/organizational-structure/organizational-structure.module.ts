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
  BranchRepository,
} from "./domain/repositories";
import { registerOrganizationalStructureHttpRoutes } from "./http";
import { PrismaDepartmentRepository } from "./infra/prisma/prisma-department.repository";
import { PrismaBranchRepository } from "./infra/prisma/prisma-branch.repository";
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
import { registerCreateBranchRoute } from "./http/create-branch.route";
import { registerUpdateBranchRoute } from "./http/update-branch.route";
import { registerListBranchesRoute } from "./http/list-branches.route";
import { registerDeleteBranchRoute } from "./http/delete-branch.route";
import { registerCreateBusinessSegmentRoute } from "./http/create-business-segment.route";
import { registerCreateDepartmentRoute } from "./http/create-department.route";
import { registerCreatePositionRoute } from "./http/create-position.route";
import { registerCreateSectorRoute } from "./http/create-sector.route";
import { registerCreateWorkflowPolicyRoute } from "./http/create-workflow-policy.route";
import { registerDeleteBusinessSegmentRoute } from "./http/delete-business-segment.route";
import { registerDeleteDepartmentRoute } from "./http/delete-department.route";
import { registerDeletePositionRoute } from "./http/delete-position.route";
import { registerDeleteSectorRoute } from "./http/delete-sector.route";
import { registerDeleteWorkflowPolicyRoute } from "./http/delete-workflow-policy.route";
import { registerListBusinessSegmentsRoute } from "./http/list-business-segments.route";
import { registerListDepartmentsRoute } from "./http/list-departments.route";
import { registerListPositionsRoute } from "./http/list-positions.route";
import { registerListSectorsRoute } from "./http/list-sectors.route";
import { registerListWorkflowPoliciesRoute } from "./http/list-workflow-policies.route";
import { registerUpdateBusinessSegmentRoute } from "./http/update-business-segment.route";
import { registerUpdateDepartmentRoute } from "./http/update-department.route";
import { registerUpdatePositionRoute } from "./http/update-position.route";
import { registerUpdateSectorRoute } from "./http/update-sector.route";
import { registerUpdateWorkflowPolicyRoute } from "./http/update-workflow-policy.route";
import { PrismaBusinessSegmentRepository } from "./infra/prisma/prisma-business-segment.repository";
import { PrismaWorkflowPolicyRepository } from "./infra/prisma/prisma-workflow-policy.repository";

export type OrganizationalStructureModuleOptions = {
  departmentRepository?: DepartmentRepository;
  branchRepository?: BranchRepository;
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

  const branchRepository = new PrismaBranchRepository();
  const businessSegmentRepository = new PrismaBusinessSegmentRepository();
  const workflowPolicyRepository = new PrismaWorkflowPolicyRepository();

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
        "/branches",
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

  if (branchRepository) {
    await registerCreateBranchRoute(app, { branchRepository });
    await registerUpdateBranchRoute(app, { branchRepository });
    await registerListBranchesRoute(app, { branchRepository });
    await registerDeleteBranchRoute(app, { branchRepository });
  }

  if (businessSegmentRepository) {
    await registerCreateBusinessSegmentRoute(app, { businessSegmentRepository });
    await registerUpdateBusinessSegmentRoute(app, { businessSegmentRepository });
    await registerListBusinessSegmentsRoute(app, { businessSegmentRepository });
    await registerDeleteBusinessSegmentRoute(app, { businessSegmentRepository });
  }

  if (workflowPolicyRepository) {
    await registerCreateWorkflowPolicyRoute(app, { workflowPolicyRepository });
    await registerUpdateWorkflowPolicyRoute(app, { workflowPolicyRepository });
    await registerListWorkflowPoliciesRoute(app, { workflowPolicyRepository });
    await registerDeleteWorkflowPolicyRoute(app, { workflowPolicyRepository });
  }

  app.log.info("Módulo Estrutura Organizacional registrado");

  return {
    departmentRepository,
    branchRepository,
    sectorRepository,
    positionRepository,
    auditLogRepository,
    eventBus,
    positionMembershipRepository,
    departmentMembershipRepository,
    sectorMembershipRepository,
  };
}
