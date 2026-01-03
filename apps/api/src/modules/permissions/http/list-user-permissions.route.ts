import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { ListarUserPermissionsUseCase } from "../application/use-cases/listar-user-permissions.use-case";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";

type Dependencies = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  positionRepository?: PositionRepository;
};

export async function registerListUserPermissionsRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/users/:userId/permissions", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const { userId } = request.params as { userId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarUserPermissionsUseCase({
        permissionRepository: deps.permissionRepository,
        organizationRepository: deps.organizationRepository,
        positionPermissionRepository: deps.positionPermissionRepository,
        sectorPermissionRepository: deps.sectorPermissionRepository,
        departmentPermissionRepository: deps.departmentPermissionRepository,
        positionMembershipRepository: deps.positionMembershipRepository,
        positionRepository: deps.positionRepository,
        departmentMembershipRepository: deps.departmentMembershipRepository,
      });

      const input = { orgId, userId };
      const resultado = await useCase.execute(input);

      return reply.send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar permissões do usuário");
      return reply.status(500).send({ message: "Erro ao listar permissões" });
    }
  });

  // Rota para verificar uma permissão específica
  app.get(
    "/users/:userId/permissions/check",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const { userId } = request.params as { userId: string };
      const { permission } = request.query as { permission?: string };

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!permission) {
        return reply.status(400).send({ message: "permission é obrigatório" });
      }

      try {
        const { VerificarPermissionUseCase } = await import(
          "../application/use-cases/verificar-permission.use-case"
        );
        const useCase = new VerificarPermissionUseCase({
          permissionRepository: deps.permissionRepository,
          organizationRepository: deps.organizationRepository,
          positionPermissionRepository: deps.positionPermissionRepository,
          sectorPermissionRepository: deps.sectorPermissionRepository,
          departmentPermissionRepository: deps.departmentPermissionRepository,
          positionMembershipRepository: deps.positionMembershipRepository,
          departmentMembershipRepository: deps.departmentMembershipRepository,
          positionRepository: deps.positionRepository,
          permissionCacheService: deps.permissionCacheService,
          accessAuditLogRepository: deps.accessAuditLogRepository,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          resource: request.url,
          endpoint: request.url,
        });

        const input = { orgId, userId, permission };
        const resultado = await useCase.execute(input);

        return reply.send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao verificar permissão");
        return reply.status(500).send({ message: "Erro ao verificar permissão" });
      }
    },
  );
}
