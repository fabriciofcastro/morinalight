import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type {
  DepartmentRepository,
  OrganizationalStructureAuditLogRepository,
  PositionRepository,
  SectorRepository,
} from "../domain/repositories";
import { registerCreateDepartmentRoute } from "./create-department.route";
import { registerCreatePositionRoute } from "./create-position.route";
import { registerCreateSectorRoute } from "./create-sector.route";
import { registerDeleteDepartmentRoute } from "./delete-department.route";
import { registerDeletePositionRoute } from "./delete-position.route";
import { registerDeleteSectorRoute } from "./delete-sector.route";
import { registerGetDepartmentRoute } from "./get-department.route";
import { registerGetPositionRoute } from "./get-position.route";
import { registerGetSectorRoute } from "./get-sector.route";
import { registerListDepartmentsRoute } from "./list-departments.route";
import { registerListPositionsRoute } from "./list-positions.route";
import { registerListSectorsRoute } from "./list-sectors.route";
import { registerUpdateDepartmentRoute } from "./update-department.route";
import { registerUpdatePositionRoute } from "./update-position.route";
import { registerUpdateSectorRoute } from "./update-sector.route";

import type { DepartmentMembershipRepository } from "../infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../infra/prisma/prisma-position-membership.repository";
import type { SectorMembershipRepository } from "../infra/prisma/prisma-sector-membership.repository";

type OrganizationalStructureHttpDeps = {
  departmentRepository: DepartmentRepository;
  sectorRepository: SectorRepository;
  positionRepository: PositionRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  sectorMembershipRepository?: SectorMembershipRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerOrganizationalStructureHttpRoutes(
  app: FastifyInstance,
  deps: OrganizationalStructureHttpDeps,
) {
  // Departments
  await registerCreateDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerListDepartmentsRoute(app, {
    departmentRepository: deps.departmentRepository,
  });

  await registerGetDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
  });

  await registerUpdateDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeleteDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
    sectorRepository: deps.sectorRepository,
    departmentMembershipRepository: deps.departmentMembershipRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  // Sectors
  await registerCreateSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
    departmentRepository: deps.departmentRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerListSectorsRoute(app, {
    sectorRepository: deps.sectorRepository,
  });

  await registerGetSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
  });

  await registerUpdateSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeleteSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
    positionRepository: deps.positionRepository,
    sectorMembershipRepository: deps.sectorMembershipRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  // Positions
  await registerCreatePositionRoute(app, {
    positionRepository: deps.positionRepository,
    sectorRepository: deps.sectorRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerListPositionsRoute(app, {
    positionRepository: deps.positionRepository,
  });

  await registerGetPositionRoute(app, {
    positionRepository: deps.positionRepository,
  });

  await registerUpdatePositionRoute(app, {
    positionRepository: deps.positionRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeletePositionRoute(app, {
    positionRepository: deps.positionRepository,
    positionMembershipRepository: deps.positionMembershipRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });
}
