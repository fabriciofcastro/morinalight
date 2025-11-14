import type { FastifyInstance } from "fastify";
import type { DepartmentRepository } from "../../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../../organizational-structure/domain/repositories/sector-repository";
import type { DepartmentMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PermissionTemplateRepository } from "../domain/repositories/permission-template-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import { registerDepartmentPermissionsRoute } from "./department-permissions.route";
import { registerListUserPermissionsRoute } from "./list-user-permissions.route";
import { registerPermissionAuditLogRoute } from "./permission-audit-log.route";
import { registerPermissionTemplatesRoute } from "./permission-templates.route";
import { registerPositionPermissionsRoute } from "./position-permissions.route";
import { registerSectorPermissionsRoute } from "./sector-permissions.route";

type PermissionsHttpDeps = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionRepository?: PositionRepository;
  sectorRepository?: SectorRepository;
  departmentRepository?: DepartmentRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  templateRepository?: PermissionTemplateRepository;
};

export async function registerPermissionsHttpRoutes(
  app: FastifyInstance,
  deps: PermissionsHttpDeps,
) {
  await registerListUserPermissionsRoute(app, {
    permissionRepository: deps.permissionRepository,
    organizationRepository: deps.organizationRepository,
    positionPermissionRepository: deps.positionPermissionRepository,
    sectorPermissionRepository: deps.sectorPermissionRepository,
    departmentPermissionRepository: deps.departmentPermissionRepository,
    positionMembershipRepository: deps.positionMembershipRepository,
    departmentMembershipRepository: deps.departmentMembershipRepository,
    positionRepository: deps.positionRepository,
  });

  // Registrar rotas de permissões por cargo
  if (deps.positionPermissionRepository && deps.positionRepository && deps.permissionRepository) {
    await registerPositionPermissionsRoute(app, {
      positionPermissionRepository: deps.positionPermissionRepository,
      positionRepository: deps.positionRepository,
      permissionRepository: deps.permissionRepository,
      auditLogRepository: deps.auditLogRepository,
    });
  }

  // Registrar rotas de permissões por setor
  if (deps.sectorPermissionRepository && deps.sectorRepository && deps.permissionRepository) {
    await registerSectorPermissionsRoute(app, {
      sectorPermissionRepository: deps.sectorPermissionRepository,
      sectorRepository: deps.sectorRepository,
      permissionRepository: deps.permissionRepository,
      auditLogRepository: deps.auditLogRepository,
    });
  }

  // Registrar rotas de permissões por departamento
  if (
    deps.departmentPermissionRepository &&
    deps.departmentRepository &&
    deps.permissionRepository
  ) {
    await registerDepartmentPermissionsRoute(app, {
      departmentPermissionRepository: deps.departmentPermissionRepository,
      departmentRepository: deps.departmentRepository,
      permissionRepository: deps.permissionRepository,
      auditLogRepository: deps.auditLogRepository,
    });
  }

  // Registrar rota de histórico de permissões
  if (deps.auditLogRepository) {
    await registerPermissionAuditLogRoute(app, {
      auditLogRepository: deps.auditLogRepository,
    });
  }

  // Registrar rotas de templates de permissões
  if (deps.templateRepository) {
    await registerPermissionTemplatesRoute(app, {
      templateRepository: deps.templateRepository,
      positionPermissionRepository: deps.positionPermissionRepository,
      sectorPermissionRepository: deps.sectorPermissionRepository,
      departmentPermissionRepository: deps.departmentPermissionRepository,
      positionRepository: deps.positionRepository,
      sectorRepository: deps.sectorRepository,
      departmentRepository: deps.departmentRepository,
      auditLogRepository: deps.auditLogRepository,
    });
  }
}
