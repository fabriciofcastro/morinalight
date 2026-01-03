import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { UserRepository } from "../../users/repositories/user.repository";
import { organizationRoleSchema } from "../application/schemas/membership.schema";
import { AdicionarMembroDepartamentoUseCase } from "../application/use-cases/adicionar-membro-department.use-case";
import { AtualizarRoleMembroDepartamentoUseCase } from "../application/use-cases/atualizar-role-membro-department.use-case";
import { ListarMembrosDepartamentoUseCase } from "../application/use-cases/listar-membros-department.use-case";
import { RemoverMembroDepartamentoUseCase } from "../application/use-cases/remover-membro-department.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { DepartmentMembershipRepository } from "../infra/prisma/prisma-department-membership.repository";

type Dependencies = {
  departmentMembershipRepository: DepartmentMembershipRepository;
  departmentRepository: DepartmentRepository;
  userRepository: UserRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDepartmentMembersRoutes(app: FastifyInstance, deps: Dependencies) {
  // Listar membros de um departamento
  app.get(
    "/departments/:departmentId/members",
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
        const { departmentId } = z
          .object({ departmentId: z.string().uuid() })
          .parse(request.params);

        const useCase = new ListarMembrosDepartamentoUseCase({
          departmentMembershipRepository: deps.departmentMembershipRepository,
          departmentRepository: deps.departmentRepository,
          userRepository: deps.userRepository,
        });

        const members = await useCase.execute(orgId, departmentId);

        return reply.status(200).send({ itens: members });
      } catch (error) {
        app.log.error(error, "Erro ao listar membros do departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar membros do departamento" });
      }
    },
  );

  // Adicionar membro a um departamento
  app.post(
    "/departments/:departmentId/members",
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
        const { departmentId } = z
          .object({ departmentId: z.string().uuid() })
          .parse(request.params);
        const body = z
          .object({
            userId: z.string().uuid(),
            role: organizationRoleSchema.default("member"),
          })
          .parse(request.body);

        const useCase = new AdicionarMembroDepartamentoUseCase({
          departmentMembershipRepository: deps.departmentMembershipRepository,
          departmentRepository: deps.departmentRepository,
          userRepository: deps.userRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = {
          orgId,
          departmentId,
          userId: body.userId,
          role: body.role,
        };

        const membership = await useCase.execute(input);

        return reply.status(201).send(membership);
      } catch (error) {
        app.log.error(error, "Erro ao adicionar membro ao departamento");

        if (error instanceof Error) {
          if (error.message.includes("já é membro")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao adicionar membro ao departamento" });
      }
    },
  );

  // Remover membro de um departamento
  app.delete(
    "/departments/:departmentId/members/:userId",
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
        const { departmentId, userId } = z
          .object({
            departmentId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);

        const useCase = new RemoverMembroDepartamentoUseCase({
          departmentMembershipRepository: deps.departmentMembershipRepository,
          departmentRepository: deps.departmentRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          departmentId,
          userId,
        };

        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover membro do departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover membro do departamento" });
      }
    },
  );

  // Atualizar role de um membro
  app.patch(
    "/departments/:departmentId/members/:userId",
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
        const { departmentId, userId } = z
          .object({
            departmentId: z.string().uuid(),
            userId: z.string().uuid(),
          })
          .parse(request.params);
        const body = z
          .object({
            role: organizationRoleSchema,
          })
          .parse(request.body);

        const useCase = new AtualizarRoleMembroDepartamentoUseCase({
          departmentMembershipRepository: deps.departmentMembershipRepository,
          departmentRepository: deps.departmentRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId,
        });

        const input = {
          orgId,
          departmentId,
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
