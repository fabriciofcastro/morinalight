import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { UserRepository } from "../../users/repositories/user.repository";
import { organizationRoleSchema } from "../application/schemas/membership.schema";
import { AdicionarMembroSetorUseCase } from "../application/use-cases/adicionar-membro-sector.use-case";
import { AtualizarRoleMembroSetorUseCase } from "../application/use-cases/atualizar-role-membro-sector.use-case";
import { ListarMembrosSetorUseCase } from "../application/use-cases/listar-membros-sector.use-case";
import { RemoverMembroSetorUseCase } from "../application/use-cases/remover-membro-sector.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../infra/prisma/prisma-sector-membership.repository";

type Dependencies = {
  sectorMembershipRepository: SectorMembershipRepository;
  sectorRepository: SectorRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerSectorMembersRoutes(app: FastifyInstance, deps: Dependencies) {
  // Listar membros de um setor
  app.get(
    "/sectors/:sectorId/members",
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
        const { sectorId } = z.object({ sectorId: z.string().uuid() }).parse(request.params);

        const useCase = new ListarMembrosSetorUseCase({
          sectorMembershipRepository: deps.sectorMembershipRepository,
          sectorRepository: deps.sectorRepository,
          userRepository: deps.userRepository,
        });

        const members = await useCase.execute(orgId, sectorId);

        return reply.status(200).send({ itens: members });
      } catch (error) {
        app.log.error(error, "Erro ao listar membros do setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar membros do setor" });
      }
    },
  );

  // Adicionar membro a um setor
  app.post(
    "/sectors/:sectorId/members",
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
        const { sectorId } = z.object({ sectorId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            userId: z.string().uuid(),
            role: organizationRoleSchema.default("member"),
          })
          .parse(request.body);

        const useCase = new AdicionarMembroSetorUseCase({
          sectorMembershipRepository: deps.sectorMembershipRepository,
          sectorRepository: deps.sectorRepository,
          userRepository: deps.userRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = {
          orgId,
          sectorId,
          userId: body.userId,
          role: body.role,
        };

        const membership = await useCase.execute(input);

        return reply.status(201).send(membership);
      } catch (error) {
        app.log.error(error, "Erro ao adicionar membro ao setor");

        if (error instanceof Error) {
          if (error.message.includes("já é membro")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao adicionar membro ao setor" });
      }
    },
  );

  // Remover membro de um setor
  app.delete(
    "/sectors/:sectorId/members/:userId",
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
        const { sectorId, userId } = z
          .object({
            sectorId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);

        const useCase = new RemoverMembroSetorUseCase({
          sectorMembershipRepository: deps.sectorMembershipRepository,
          sectorRepository: deps.sectorRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          sectorId,
          userId,
        };

        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover membro do setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover membro do setor" });
      }
    },
  );

  // Atualizar role de um membro
  app.patch(
    "/sectors/:sectorId/members/:userId",
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
        const { sectorId, userId } = z
          .object({
            sectorId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);
        const body = z
          .object({
            role: organizationRoleSchema,
          })
          .parse(request.body);

        const useCase = new AtualizarRoleMembroSetorUseCase({
          sectorMembershipRepository: deps.sectorMembershipRepository,
          sectorRepository: deps.sectorRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          sectorId,
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

