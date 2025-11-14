import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarClienteUseCase } from "../application/use-cases/atualizar-cliente.use-case";
import type { ClienteRepository } from "../domain/repositories/cliente-repository";

type Dependencies = {
  clienteRepository: ClienteRepository;
};

export async function registerUpdateClienteRoute(app: FastifyInstance, deps: Dependencies) {
  app.put("/clientes/:clienteId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
    const { clienteId } = request.params as { clienteId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new AtualizarClienteUseCase({
        clienteRepository: deps.clienteRepository,
        actorId: userId,
      });

      const input = { ...request.body, orgId, clienteId } as unknown;
      const cliente = await useCase.execute(input);

      return reply.send(cliente);
    } catch (error) {
      app.log.error(error, "Erro ao atualizar cliente");

      if (error instanceof Error) {
        if (error.message.includes("não encontrado")) {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao atualizar cliente" });
    }
  });
}
