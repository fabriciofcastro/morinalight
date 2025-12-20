import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type { DepartmentRepository } from "../../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../../organizational-structure/domain/repositories/sector-repository";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import type { DepartmentMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PermissionTemplateRepository } from "../domain/repositories/permission-template-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { UserPermissionRepository } from "../domain/repositories/user-permission-repository";
import { registerDepartmentPermissionsRoute } from "./department-permissions.route";
import { registerListUserPermissionsRoute } from "./list-user-permissions.route";
import { registerPermissionAuditLogRoute } from "./permission-audit-log.route";
import { registerPermissionChangeRequestsRoute } from "./permission-change-requests.route";
import { registerPermissionTemplatesRoute } from "./permission-templates.route";
import { registerPositionPermissionsRoute } from "./position-permissions.route";
import { registerSectorPermissionsRoute } from "./sector-permissions.route";
import { registerUserCustomPermissionsRoute } from "./user-custom-permissions.route";
import { registerUserEffectivePermissionsRoute } from "./user-effective-permissions.route";
import { registerBulkAssignPermissionsRoute } from "./bulk-assign-permissions.route";

type PermissionsHttpDeps = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  userPermissionRepository?: UserPermissionRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
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
  eventBus?: DomainEventBus;
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

  await registerUserEffectivePermissionsRoute(app, {
    permissionRepository: deps.permissionRepository,
    organizationRepository: deps.organizationRepository,
    positionPermissionRepository: deps.positionPermissionRepository,
    sectorPermissionRepository: deps.sectorPermissionRepository,
    departmentPermissionRepository: deps.departmentPermissionRepository,
    userPermissionRepository: deps.userPermissionRepository,
    positionMembershipRepository: deps.positionMembershipRepository,
    departmentMembershipRepository: deps.departmentMembershipRepository,
    positionRepository: deps.positionRepository,
  });

  if (deps.userPermissionRepository) {
    await registerUserCustomPermissionsRoute(app, {
      userPermissionRepository: deps.userPermissionRepository,
      permissionRepository: deps.permissionRepository,
      organizationRepository: deps.organizationRepository,
      permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
      workflowPolicyRepository: deps.workflowPolicyRepository,
      auditLogRepository: deps.auditLogRepository,
      eventBus: deps.eventBus,
    });
  }

  if (deps.permissionChangeRequestRepository && deps.workflowPolicyRepository) {
    await registerPermissionChangeRequestsRoute(app, {
      permissionRepository: deps.permissionRepository,
      organizationRepository: deps.organizationRepository,
      workflowPolicyRepository: deps.workflowPolicyRepository,
      permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
      positionPermissionRepository: deps.positionPermissionRepository,
      sectorPermissionRepository: deps.sectorPermissionRepository,
      departmentPermissionRepository: deps.departmentPermissionRepository,
      userPermissionRepository: deps.userPermissionRepository,
      auditLogRepository: deps.auditLogRepository,
      eventBus: deps.eventBus,
    });
  }

  // Registrar rotas de permissões por cargo
  if (deps.positionPermissionRepository && deps.positionRepository && deps.permissionRepository) {
    await registerPositionPermissionsRoute(app, {
      positionPermissionRepository: deps.positionPermissionRepository,
      positionRepository: deps.positionRepository,
      permissionRepository: deps.permissionRepository,
      organizationRepository: deps.organizationRepository,
      permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
      workflowPolicyRepository: deps.workflowPolicyRepository,
      auditLogRepository: deps.auditLogRepository,
      eventBus: deps.eventBus,
    });
  }

  // Registrar rotas de permissões por setor
  if (deps.sectorPermissionRepository && deps.sectorRepository && deps.permissionRepository) {
    await registerSectorPermissionsRoute(app, {
      sectorPermissionRepository: deps.sectorPermissionRepository,
      sectorRepository: deps.sectorRepository,
      permissionRepository: deps.permissionRepository,
      organizationRepository: deps.organizationRepository,
      permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
      workflowPolicyRepository: deps.workflowPolicyRepository,
      auditLogRepository: deps.auditLogRepository,
      eventBus: deps.eventBus,
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
      organizationRepository: deps.organizationRepository,
      permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
      workflowPolicyRepository: deps.workflowPolicyRepository,
      auditLogRepository: deps.auditLogRepository,
      eventBus: deps.eventBus,
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
      eventBus: deps.eventBus,
    });
  }

  // Registrar rota de bulk assign permissions
  await registerBulkAssignPermissionsRoute(app, {
    permissionRepository: deps.permissionRepository,
    departmentRepository: deps.departmentRepository,
    sectorRepository: deps.sectorRepository,
    positionRepository: deps.positionRepository,
    departmentPermissionRepository: deps.departmentPermissionRepository,
    sectorPermissionRepository: deps.sectorPermissionRepository,
    positionPermissionRepository: deps.positionPermissionRepository,
    userPermissionRepository: deps.userPermissionRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });
}
