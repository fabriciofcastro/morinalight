import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CriarRepresentanteUseCase } from "../application/use-cases/criar-representante.use-case";
import type {
  ClienteRepository,
  RepresentanteRepository,
} from "../domain/repositories";

type Dependencies = {
  clienteRepository: ClienteRepository;
  representanteRepository: RepresentanteRepository;
};

export async function registerCreateRepresentanteRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/representantes", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarRepresentanteUseCase({
        clienteRepository: deps.clienteRepository,
        representanteRepository: deps.representanteRepository,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const representante = await useCase.execute(input);

      return reply.status(201).send(representante);
    } catch (error) {
      app.log.error(error, "Erro ao criar representante");

      if (error instanceof Error) {
        if (error.message.includes("não encontrado")) {
          return reply.status(404).send({ message: error.message });
        }
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar representante" });
    }
  });
}

