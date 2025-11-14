import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { UserRepository } from "../../users/repositories/user.repository";
import { organizationRoleSchema } from "../application/schemas/membership.schema";
import { AdicionarMembroUnidadeUseCase } from "../application/use-cases/adicionar-membro-unidade.use-case";
import { AtualizarRoleMembroUnidadeUseCase } from "../application/use-cases/atualizar-role-membro-unidade.use-case";
import { ListarMembrosUnidadeUseCase } from "../application/use-cases/listar-membros-unidade.use-case";
import { RemoverMembroUnidadeUseCase } from "../application/use-cases/remover-membro-unidade.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";
import type { UnitMembershipRepository } from "../infra/prisma/prisma-unit-membership.repository";

type Dependencies = {
  unitMembershipRepository: UnitMembershipRepository;
  organizationalUnitRepository: OrganizationalUnitRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUnitMembersRoutes(app: FastifyInstance, deps: Dependencies) {
  // Listar membros de uma unidade
  app.get(
    "/organizational-units/:unitId/members",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { unitId } = z.object({ unitId: z.string().uuid() }).parse(request.params);

        const useCase = new ListarMembrosUnidadeUseCase({
          unitMembershipRepository: deps.unitMembershipRepository,
          organizationalUnitRepository: deps.organizationalUnitRepository,
          userRepository: deps.userRepository,
        });

        const members = await useCase.execute(orgId, unitId);

        return reply.status(200).send({ itens: members });
      } catch (error) {
        app.log.error(error, "Erro ao listar membros da unidade");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar membros da unidade" });
      }
    },
  );

  // Adicionar membro a uma unidade
  app.post(
    "/organizational-units/:unitId/members",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { unitId } = z.object({ unitId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            userId: z.string().uuid(),
            role: organizationRoleSchema.default("member"),
          })
          .parse(request.body);

        const useCase = new AdicionarMembroUnidadeUseCase({
          unitMembershipRepository: deps.unitMembershipRepository,
          organizationalUnitRepository: deps.organizationalUnitRepository,
          userRepository: deps.userRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = {
          orgId,
          unitId,
          userId: body.userId,
          role: body.role,
        };

        const membership = await useCase.execute(input);

        return reply.status(201).send(membership);
      } catch (error) {
        app.log.error(error, "Erro ao adicionar membro à unidade");

        if (error instanceof Error) {
          if (error.message.includes("já é membro")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao adicionar membro à unidade" });
      }
    },
  );

  // Remover membro de uma unidade
  app.delete(
    "/organizational-units/:unitId/members/:userId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!actorId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { unitId, userId } = z
          .object({
            unitId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);

        const useCase = new RemoverMembroUnidadeUseCase({
          unitMembershipRepository: deps.unitMembershipRepository,
          organizationalUnitRepository: deps.organizationalUnitRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          unitId,
          userId,
        };

        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover membro da unidade");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover membro da unidade" });
      }
    },
  );

  // Atualizar role de um membro
  app.patch(
    "/organizational-units/:unitId/members/:userId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!actorId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { unitId, userId } = z
          .object({
            unitId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);
        const body = z
          .object({
            role: organizationRoleSchema,
          })
          .parse(request.body);

        const useCase = new AtualizarRoleMembroUnidadeUseCase({
          unitMembershipRepository: deps.unitMembershipRepository,
          organizationalUnitRepository: deps.organizationalUnitRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          unitId,
          userId,
          role: body.role,
        };

        const membership = await useCase.execute(input);

        return reply.status(200).send(membership);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar role do membro");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar role do membro" });
      }
    },
  );
}
