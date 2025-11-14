import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CriarClienteUseCase } from "../application/use-cases/criar-cliente.use-case";
import type { ClienteRepository } from "../domain/repositories/cliente-repository";

type Dependencies = {
  clienteRepository: ClienteRepository;
};

export async function registerCreateClienteRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/clientes", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarClienteUseCase({
        clienteRepository: deps.clienteRepository,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const cliente = await useCase.execute(input);

      return reply.status(201).send(cliente);
    } catch (error) {
      app.log.error(error, "Erro ao criar cliente");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar cliente" });
    }
  });
}

