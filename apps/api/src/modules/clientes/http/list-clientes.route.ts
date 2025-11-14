import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ListarClientesUseCase } from "../application/use-cases/listar-clientes.use-case";
import type { ClienteRepository } from "../domain/repositories/cliente-repository";

type Dependencies = {
  clienteRepository: ClienteRepository;
};

export async function registerListClientesRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/clientes", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarClientesUseCase({
        clienteRepository: deps.clienteRepository,
      });

      const input = { ...request.query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar clientes");
      return reply.status(500).send({ message: "Erro ao listar clientes" });
    }
  });
}

