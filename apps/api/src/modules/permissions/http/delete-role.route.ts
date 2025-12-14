import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarRoleUseCase } from "../application/use-cases/deletar-role.use-case";
import type { RoleRepository } from "../domain/repositories/role-repository";

type Dependencies = {
  roleRepository: RoleRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteRoleRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete("/roles/:roleId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
    const { roleId } = request.params as { roleId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new DeletarRoleUseCase({
        roleRepository: deps.roleRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      await useCase.execute({ orgId, roleId });

      return reply.status(204).send();
    } catch (error) {
      app.log.error(error, "Erro ao deletar perfil");

      if (error instanceof Error) {
        if (error.message.includes("não encontrado")) {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao deletar perfil" });
    }
  });
}
