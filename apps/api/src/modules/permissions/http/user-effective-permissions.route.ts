import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { DepartmentMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-department-membership.repository";
import type { PositionMembershipRepository } from "../../organizational-structure/infra/prisma/prisma-position-membership.repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { UserRepository } from "../../users/repositories/user.repository";
import { ResolverPermissoesEfetivasUseCase } from "../application/use-cases/resolver-permissoes-efetivas.use-case";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { UserPermissionRepository } from "../domain/repositories/user-permission-repository";
import type { PermissionInheritanceService } from "../domain/services/permission-inheritance.service";

type Dependencies = {
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  userPermissionRepository?: UserPermissionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  positionRepository?: PositionRepository;
  permissionInheritanceService?: PermissionInheritanceService;
  permissionCacheService?: any;
  userRepository?: UserRepository;
};

export async function registerUserEffectivePermissionsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/users/:userId/permissions/effective",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const { userId } = request.params as { userId: string };

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      try {
        const useCase = new ResolverPermissoesEfetivasUseCase({
          permissionRepository: deps.permissionRepository,
          organizationRepository: deps.organizationRepository,
          positionPermissionRepository: deps.positionPermissionRepository,
          sectorPermissionRepository: deps.sectorPermissionRepository,
          departmentPermissionRepository: deps.departmentPermissionRepository,
          userPermissionRepository: deps.userPermissionRepository,
          positionMembershipRepository: deps.positionMembershipRepository,
          departmentMembershipRepository: deps.departmentMembershipRepository,
          positionRepository: deps.positionRepository,
          permissionInheritanceService: deps.permissionInheritanceService,
          permissionCacheService: deps.permissionCacheService,
          userRepository: deps.userRepository,
        });

        const resultado = await useCase.execute({ orgId, userId });
        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao resolver permissões efetivas");
        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }
        return reply.status(500).send({ message: "Erro ao resolver permissões efetivas" });
      }
    },
  );
}
