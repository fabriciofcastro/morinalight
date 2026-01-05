import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { DepartmentRepository } from "../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../organizational-structure/domain/repositories/sector-repository";
import type { WorkflowPolicyRepository } from "../organizational-structure/domain/repositories/workflow-policy-repository";
import type { PositionMembershipRepository } from "../organizational-structure/infra/prisma/prisma-position-membership.repository";
import { PrismaWorkflowPolicyRepository } from "../organizational-structure/infra/prisma/prisma-workflow-policy.repository";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { UserRepository } from "../users/repositories/user.repository";
import { PrismaUserRepository } from "../users/infra/prisma/prisma-user.repository";
import type { DepartmentMembershipRepository } from "../organizational-structure/infra/prisma/prisma-department-membership.repository";
import { PrismaDepartmentMembershipRepository } from "../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type {
  DepartmentPermissionRepository,
  PermissionAuditLogRepository,
  PermissionChangeRequestRepository,
  PermissionRepository,
  PermissionTemplateRepository,
  PositionPermissionRepository,
  RoleRepository,
  SectorPermissionRepository,
  UserPermissionRepository,
  AccessAuditLogRepository,
} from "./domain/repositories";
import { registerPermissionsHttpRoutes } from "./http";
import { registerCreatePermissionRoute } from "./http/create-permission.route";
import { registerCreateRoleRoute } from "./http/create-role.route";
import { registerDeletePermissionRoute } from "./http/delete-permission.route";
import { registerDeleteRoleRoute } from "./http/delete-role.route";
import { registerGetPermissionRoute } from "./http/get-permission.route";
import { registerGetRoleRoute } from "./http/get-role.route";
import { registerListPermissionsRoute } from "./http/list-permissions.route";
import { registerListRolesRoute } from "./http/list-roles.route";
import { registerUpdatePermissionRoute } from "./http/update-permission.route";
import { registerUpdateRoleRoute } from "./http/update-role.route";
import { PrismaAccessAuditLogRepository } from "./infra/prisma/prisma-access-audit-log.repository";
import { PrismaDepartmentPermissionRepository } from "./infra/prisma/prisma-department-permission.repository";
import { PrismaPermissionRepository } from "./infra/prisma/prisma-permission.repository";
import { PrismaPermissionAuditLogRepository } from "./infra/prisma/prisma-permission-audit-log.repository";
import { PrismaPermissionChangeRequestRepository } from "./infra/prisma/prisma-permission-change-request.repository";
import { PrismaPermissionTemplateRepository } from "./infra/prisma/prisma-permission-template.repository";
import { PrismaPositionPermissionRepository } from "./infra/prisma/prisma-position-permission.repository";
import { PrismaRoleRepository } from "./infra/prisma/prisma-role.repository";
import { PrismaSectorPermissionRepository } from "./infra/prisma/prisma-sector-permission.repository";
import { PrismaUserPermissionRepository } from "./infra/prisma/prisma-user-permission.repository";
import { InMemoryPermissionCacheService } from "./infra/cache/in-memory-permission-cache.service";
import { RedisPermissionCacheService } from "./infra/cache/redis-permission-cache.service";
import { PermissionInheritanceServiceImpl } from "./infra/services/permission-inheritance.service";
import type { PermissionCacheService } from "./domain/services/permission-cache.service";
import type { PermissionInheritanceService } from "./domain/services/permission-inheritance.service";

export type PermissionsModuleOptions = {
  permissionRepository?: PermissionRepository;
  organizationRepository?: OrganizationRepository;
  positionRepository?: PositionRepository;
  sectorRepository?: SectorRepository;
  departmentRepository?: DepartmentRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  userPermissionRepository?: UserPermissionRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  userRepository?: UserRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  accessAuditLogRepository?: AccessAuditLogRepository;
  permissionCacheService?: PermissionCacheService;
  permissionInheritanceService?: PermissionInheritanceService;
  templateRepository?: PermissionTemplateRepository;
  roleRepository?: RoleRepository;
  eventBus?: DomainEventBus;
};

export async function registerPermissionsModule(
  app: FastifyInstance,
  options: PermissionsModuleOptions = {},
) {
  const permissionRepository =
    options.permissionRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionRepository() : undefined);

  const positionPermissionRepository =
    options.positionPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaPositionPermissionRepository() : undefined);

  const userPermissionRepository =
    options.userPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaUserPermissionRepository() : undefined);

  const permissionChangeRequestRepository =
    options.permissionChangeRequestRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionChangeRequestRepository() : undefined);

  const workflowPolicyRepository =
    options.workflowPolicyRepository ??
    (process.env.DATABASE_URL ? new PrismaWorkflowPolicyRepository() : undefined);

  const sectorPermissionRepository =
    options.sectorPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaSectorPermissionRepository() : undefined);

  const departmentPermissionRepository =
    options.departmentPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentPermissionRepository() : undefined);

  const auditLogRepository =
    options.auditLogRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionAuditLogRepository() : undefined);

  const accessAuditLogRepository =
    options.accessAuditLogRepository ??
    (process.env.DATABASE_URL ? new PrismaAccessAuditLogRepository() : undefined);

  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : undefined);

  const departmentMembershipRepository =
    options.departmentMembershipRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentMembershipRepository() : undefined);

  const permissionCacheService =
    options.permissionCacheService ?? (env.REDIS_URL ? new RedisPermissionCacheService() : new InMemoryPermissionCacheService());

  const permissionInheritanceService =
    options.permissionInheritanceService ??
    (options.departmentRepository &&
      options.sectorRepository &&
      options.positionRepository &&
      departmentPermissionRepository &&
      sectorPermissionRepository &&
      positionPermissionRepository &&
      permissionRepository
      ? new PermissionInheritanceServiceImpl({
        departmentRepository: options.departmentRepository,
        sectorRepository: options.sectorRepository,
        positionRepository: options.positionRepository,
        departmentPermissionRepository,
        sectorPermissionRepository,
        positionPermissionRepository,
        permissionRepository,
      })
      : undefined);

  const templateRepository =
    options.templateRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionTemplateRepository() : undefined);

  const roleRepository =
    options.roleRepository ?? (process.env.DATABASE_URL ? new PrismaRoleRepository() : undefined);

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.notifications" })
      : undefined);

  // Aplicar hook de tenant nas rotas de permissões
  if (options.organizationRepository && permissionRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: [
        "/users/:userId/permissions",
        "/users/:userId/permissions/effective",
        "/users/:userId/permissions/custom",
        "/users/:userId/permissions/custom/:permissionId",
        "/positions/:positionId/permissions",
        "/sectors/:sectorId/permissions",
        "/departments/:departmentId/permissions",
        "/permissions/audit-log",
        "/permissions/matrix",
        "/permissions/change-requests",
        "/permissions/change-requests/sweep-sla",
        "/permissions/change-requests/:id/approve",
        "/permissions/change-requests/:id/reject",
        "/permissions/change-requests/:id/cancel",
        "/permissions/templates",
        "/permissions/templates/:templateId/apply",
        "/roles",
      ],
    });
  }

  // Registrar rotas HTTP
  if (permissionRepository && options.organizationRepository) {
    await registerPermissionsHttpRoutes(app, {
      permissionRepository,
      organizationRepository: options.organizationRepository,
      userPermissionRepository,
      permissionChangeRequestRepository,
      workflowPolicyRepository,
      positionPermissionRepository,
      sectorPermissionRepository,
      departmentPermissionRepository,
      positionRepository: options.positionRepository,
      sectorRepository: options.sectorRepository,
      departmentRepository: options.departmentRepository,
      positionMembershipRepository: options.positionMembershipRepository,
      departmentMembershipRepository,
      userRepository,
      auditLogRepository,
      templateRepository,
      templateRepository,
      eventBus,
      permissionCacheService,
      permissionInheritanceService,
    });
  }

  if (roleRepository) {
    await registerCreateRoleRoute(app, { roleRepository, eventBus });
    await registerGetRoleRoute(app, { roleRepository });
    await registerUpdateRoleRoute(app, { roleRepository, eventBus });
    await registerListRolesRoute(app, { roleRepository });
    await registerDeleteRoleRoute(app, { roleRepository, eventBus });
  }

  if (permissionRepository) {
    await registerCreatePermissionRoute(app, { permissionRepository, eventBus });
    await registerGetPermissionRoute(app, { permissionRepository });
    await registerUpdatePermissionRoute(app, { permissionRepository, eventBus });
    await registerListPermissionsRoute(app, { permissionRepository });
    await registerDeletePermissionRoute(app, { permissionRepository, eventBus });
  }

  app.log.info("Módulo Permissions registrado");

  return {
    permissionRepository,
    userPermissionRepository,
    permissionChangeRequestRepository,
    workflowPolicyRepository,
    positionPermissionRepository,
    sectorPermissionRepository,
    departmentPermissionRepository,
    auditLogRepository,
    templateRepository,
    roleRepository,
    eventBus,
  };
}
