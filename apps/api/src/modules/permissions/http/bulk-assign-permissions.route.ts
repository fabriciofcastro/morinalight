/**
 * Rota HTTP: Bulk Assign Permissions
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { BulkAssignPermissionsUseCase } from "../application/use-cases/bulk-assign-permissions.use-case";
import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { UserPermissionRepository } from "../domain/repositories/user-permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  permissionRepository: PermissionRepository;
  departmentRepository?: DepartmentRepository;
  sectorRepository?: SectorRepository;
  positionRepository?: PositionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerBulkAssignPermissionsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/permissions/bulk-assign", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = (request.headers["x-org-id"] as string) || (request.body as any).orgId;
    const userId = (request as any).user?.id || (request.headers["x-user-id"] as string);

    if (!orgId) {
      return reply.code(400).send({ error: "x-org-id header é obrigatório" });
    }

    if (!userId) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    try {
      const body = z
        .object({
          entityType: z.enum(["department", "sector", "position", "user"]),
          entityId: z.string().uuid(),
          permissionIds: z.array(z.string()).min(1),
          granted: z.boolean().default(true),
          reason: z.string().optional(),
        })
        .parse(request.body);

      const useCase = new BulkAssignPermissionsUseCase({
        ...deps,
        actorId: userId,
      });

      const result = await useCase.execute({
        orgId,
        ...body,
      });

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({
        error: "Erro ao atribuir permissões em bulk",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}









