import type { FastifyInstance } from "fastify";
import type {
  DepartmentRepository,
  SectorRepository,
  PositionRepository,
  OrganizationalStructureAuditLogRepository,
} from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import { registerCreateDepartmentRoute } from "./create-department.route";
import { registerListDepartmentsRoute } from "./list-departments.route";
import { registerUpdateDepartmentRoute } from "./update-department.route";
import { registerDeleteDepartmentRoute } from "./delete-department.route";
import { registerCreateSectorRoute } from "./create-sector.route";
import { registerListSectorsRoute } from "./list-sectors.route";
import { registerUpdateSectorRoute } from "./update-sector.route";
import { registerDeleteSectorRoute } from "./delete-sector.route";
import { registerCreatePositionRoute } from "./create-position.route";
import { registerListPositionsRoute } from "./list-positions.route";
import { registerUpdatePositionRoute } from "./update-position.route";
import { registerDeletePositionRoute } from "./delete-position.route";

type OrganizationalStructureHttpDeps = {
  departmentRepository: DepartmentRepository;
  sectorRepository: SectorRepository;
  positionRepository: PositionRepository;
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

  await registerUpdateDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeleteDepartmentRoute(app, {
    departmentRepository: deps.departmentRepository,
    sectorRepository: deps.sectorRepository,
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

  await registerUpdateSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeleteSectorRoute(app, {
    sectorRepository: deps.sectorRepository,
    positionRepository: deps.positionRepository,
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

  await registerUpdatePositionRoute(app, {
    positionRepository: deps.positionRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });

  await registerDeletePositionRoute(app, {
    positionRepository: deps.positionRepository,
    auditLogRepository: deps.auditLogRepository,
    eventBus: deps.eventBus,
  });
}

