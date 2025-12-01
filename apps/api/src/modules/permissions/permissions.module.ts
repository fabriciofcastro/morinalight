import type { FastifyInstance } from "fastify";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import type { DepartmentRepository } from "../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../organizational-structure/domain/repositories/sector-repository";
import type { PositionMembershipRepository } from "../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type {
  DepartmentPermissionRepository,
  PermissionAuditLogRepository,
  PermissionRepository,
  PermissionTemplateRepository,
  PositionPermissionRepository,
  RoleRepository,
  SectorPermissionRepository,
} from "./domain/repositories";
import { registerPermissionsHttpRoutes } from "./http";
import { registerCreatePermissionRoute } from "./http/create-permission.route";
import { registerCreateRoleRoute } from "./http/create-role.route";
import { registerDeletePermissionRoute } from "./http/delete-permission.route";
import { registerDeleteRoleRoute } from "./http/delete-role.route";
import { registerListPermissionsRoute } from "./http/list-permissions.route";
import { registerListRolesRoute } from "./http/list-roles.route";
import { registerUpdatePermissionRoute } from "./http/update-permission.route";
import { registerUpdateRoleRoute } from "./http/update-role.route";
import { PrismaDepartmentPermissionRepository } from "./infra/prisma/prisma-department-permission.repository";
import { PrismaPermissionRepository } from "./infra/prisma/prisma-permission.repository";
import { PrismaPermissionAuditLogRepository } from "./infra/prisma/prisma-permission-audit-log.repository";
import { PrismaPermissionTemplateRepository } from "./infra/prisma/prisma-permission-template.repository";
import { PrismaPositionPermissionRepository } from "./infra/prisma/prisma-position-permission.repository";
import { PrismaSectorPermissionRepository } from "./infra/prisma/prisma-sector-permission.repository";
import { PrismaRoleRepository } from "./infra/prisma/prisma-role.repository";

export type PermissionsModuleOptions = {
  permissionRepository?: PermissionRepository;
  organizationRepository?: OrganizationRepository;
  positionRepository?: PositionRepository;
  sectorRepository?: SectorRepository;
  departmentRepository?: DepartmentRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  templateRepository?: PermissionTemplateRepository;
  roleRepository?: RoleRepository;
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

  const sectorPermissionRepository =
    options.sectorPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaSectorPermissionRepository() : undefined);

  const departmentPermissionRepository =
    options.departmentPermissionRepository ??
    (process.env.DATABASE_URL ? new PrismaDepartmentPermissionRepository() : undefined);

  const auditLogRepository =
    options.auditLogRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionAuditLogRepository() : undefined);

  const templateRepository =
    options.templateRepository ??
    (process.env.DATABASE_URL ? new PrismaPermissionTemplateRepository() : undefined);

  const roleRepository =
    options.roleRepository ??
    (process.env.DATABASE_URL ? new PrismaRoleRepository() : undefined);

  // Aplicar hook de tenant nas rotas de permissões
  if (options.organizationRepository && permissionRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: [
        "/users/:userId/permissions",
        "/positions/:positionId/permissions",
        "/sectors/:sectorId/permissions",
        "/departments/:departmentId/permissions",
        "/permissions/audit-log",
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
      positionPermissionRepository,
      sectorPermissionRepository,
      departmentPermissionRepository,
      positionRepository: options.positionRepository,
      sectorRepository: options.sectorRepository,
      departmentRepository: options.departmentRepository,
      positionMembershipRepository: options.positionMembershipRepository,
      auditLogRepository,
      templateRepository,
    });
  }

  if (roleRepository) {
    await registerCreateRoleRoute(app, { roleRepository });
    await registerUpdateRoleRoute(app, { roleRepository });
    await registerListRolesRoute(app, { roleRepository });
    await registerDeleteRoleRoute(app, { roleRepository });
  }

  if (permissionRepository) {
    await registerCreatePermissionRoute(app, { permissionRepository });
    await registerUpdatePermissionRoute(app, { permissionRepository });
    await registerListPermissionsRoute(app, { permissionRepository });
    await registerDeletePermissionRoute(app, { permissionRepository });
  }

  app.log.info("Módulo Permissions registrado");

  return {
    permissionRepository,
    positionPermissionRepository,
    sectorPermissionRepository,
    departmentPermissionRepository,
    auditLogRepository,
    templateRepository,
    roleRepository,
  };
}
