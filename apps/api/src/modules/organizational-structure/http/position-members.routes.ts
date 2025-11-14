import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { UserRepository } from "../../users/repositories/user.repository";
import { organizationRoleSchema } from "../application/schemas/membership.schema";
import { AdicionarMembroCargoUseCase } from "../application/use-cases/adicionar-membro-position.use-case";
import { AtualizarRoleMembroCargoUseCase } from "../application/use-cases/atualizar-role-membro-position.use-case";
import { ListarMembrosCargoUseCase } from "../application/use-cases/listar-membros-position.use-case";
import { RemoverMembroCargoUseCase } from "../application/use-cases/remover-membro-position.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { PositionRepository } from "../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../infra/prisma/prisma-position-membership.repository";

type Dependencies = {
  positionMembershipRepository: PositionMembershipRepository;
  positionRepository: PositionRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerPositionMembersRoutes(app: FastifyInstance, deps: Dependencies) {
  // Listar membros de um cargo
  app.get(
    "/positions/:positionId/members",
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
        const { positionId } = z.object({ positionId: z.string().uuid() }).parse(request.params);

        const useCase = new ListarMembrosCargoUseCase({
          positionMembershipRepository: deps.positionMembershipRepository,
          positionRepository: deps.positionRepository,
          userRepository: deps.userRepository,
        });

        const members = await useCase.execute(orgId, positionId);

        return reply.status(200).send({ itens: members });
      } catch (error) {
        app.log.error(error, "Erro ao listar membros do cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar membros do cargo" });
      }
    },
  );

  // Adicionar membro a um cargo
  app.post(
    "/positions/:positionId/members",
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
        const { positionId } = z.object({ positionId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            userId: z.string().uuid(),
            role: organizationRoleSchema.default("member"),
          })
          .parse(request.body);

        const useCase = new AdicionarMembroCargoUseCase({
          positionMembershipRepository: deps.positionMembershipRepository,
          positionRepository: deps.positionRepository,
          userRepository: deps.userRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = {
          orgId,
          positionId,
          userId: body.userId,
          role: body.role,
        };

        const membership = await useCase.execute(input);

        return reply.status(201).send(membership);
      } catch (error) {
        app.log.error(error, "Erro ao adicionar membro ao cargo");

        if (error instanceof Error) {
          if (error.message.includes("já é membro")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao adicionar membro ao cargo" });
      }
    },
  );

  // Remover membro de um cargo
  app.delete(
    "/positions/:positionId/members/:userId",
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
        const { positionId, userId } = z
          .object({
            positionId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);

        const useCase = new RemoverMembroCargoUseCase({
          positionMembershipRepository: deps.positionMembershipRepository,
          positionRepository: deps.positionRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          positionId,
          userId,
        };

        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover membro do cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover membro do cargo" });
      }
    },
  );

  // Atualizar role de um membro
  app.patch(
    "/positions/:positionId/members/:userId",
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
        const { positionId, userId } = z
          .object({
            positionId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);
        const body = z
          .object({
            role: organizationRoleSchema,
          })
          .parse(request.body);

        const useCase = new AtualizarRoleMembroCargoUseCase({
          positionMembershipRepository: deps.positionMembershipRepository,
          positionRepository: deps.positionRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          positionId,
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

