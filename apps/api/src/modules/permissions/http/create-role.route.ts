import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarRoleUseCase } from "../application/use-cases/criar-role.use-case";
import type { RoleRepository } from "../domain/repositories/role-repository";

type Dependencies = {
  roleRepository: RoleRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateRoleRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/roles", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarRoleUseCase({
        roleRepository: deps.roleRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const input = { ...(request.body as object), orgId } as unknown;
      const role = await useCase.execute(input);

      return reply.status(201).send(role);
    } catch (error) {
      app.log.error(error, "Erro ao criar perfil");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar perfil" });
    }
  });
}
