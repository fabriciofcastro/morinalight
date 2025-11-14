import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { UserRepository } from "../../users/repositories/user.repository";
import { organizationRoleSchema } from "../application/schemas/membership.schema";
import { AdicionarMembroTeamUseCase } from "../application/use-cases/adicionar-membro-team.use-case";
import { AtualizarRoleMembroTeamUseCase } from "../application/use-cases/atualizar-role-membro-team.use-case";
import { ListarMembrosTeamUseCase } from "../application/use-cases/listar-membros-team.use-case";
import { RemoverMembroTeamUseCase } from "../application/use-cases/remover-membro-team.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { TeamRepository } from "../domain/repositories/team-repository";
import type { TeamMembershipRepository } from "../infra/prisma/prisma-team-membership.repository";

type Dependencies = {
  teamMembershipRepository: TeamMembershipRepository;
  teamRepository: TeamRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerTeamMembersRoutes(app: FastifyInstance, deps: Dependencies) {
  // Listar membros de um time
  app.get("/teams/:teamId/members", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const { teamId } = z.object({ teamId: z.string().uuid() }).parse(request.params);

      const useCase = new ListarMembrosTeamUseCase({
        teamMembershipRepository: deps.teamMembershipRepository,
        teamRepository: deps.teamRepository,
        userRepository: deps.userRepository,
      });

      const members = await useCase.execute(orgId, teamId);

      return reply.status(200).send({ itens: members });
    } catch (error) {
      app.log.error(error, "Erro ao listar membros do time");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar membros do time" });
    }
  });

  // Adicionar membro a um time
  app.post("/teams/:teamId/members", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const { teamId } = z.object({ teamId: z.string().uuid() }).parse(request.params);
      const body = z
        .object({
          userId: z.string().uuid(),
          role: organizationRoleSchema.default("member"),
        })
        .parse(request.body);

      const useCase = new AdicionarMembroTeamUseCase({
        teamMembershipRepository: deps.teamMembershipRepository,
        teamRepository: deps.teamRepository,
        userRepository: deps.userRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const input = {
        orgId,
        teamId,
        userId: body.userId,
        role: body.role,
      };

      const membership = await useCase.execute(input);

      return reply.status(201).send(membership);
    } catch (error) {
      app.log.error(error, "Erro ao adicionar membro ao time");

      if (error instanceof Error) {
        if (error.message.includes("já é membro")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao adicionar membro ao time" });
    }
  });

  // Remover membro de um time
  app.delete(
    "/teams/:teamId/members/:userId",
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
        const { teamId, userId } = z
          .object({
            teamId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);

        const useCase = new RemoverMembroTeamUseCase({
          teamMembershipRepository: deps.teamMembershipRepository,
          teamRepository: deps.teamRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          teamId,
          userId,
        };

        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover membro do time");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover membro do time" });
      }
    },
  );

  // Atualizar role de um membro
  app.patch(
    "/teams/:teamId/members/:userId",
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
        const { teamId, userId } = z
          .object({
            teamId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);
        const body = z
          .object({
            role: organizationRoleSchema,
          })
          .parse(request.body);

        const useCase = new AtualizarRoleMembroTeamUseCase({
          teamMembershipRepository: deps.teamMembershipRepository,
          teamRepository: deps.teamRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          teamId,
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
