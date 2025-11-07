import { CriarProdutoUseCase, criarProdutoInputSchema } from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

const headersSchema = z.object({
  "x-org-id": z.string().min(1),
  "x-actor-id": z.string().min(1),
});

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export async function registerCreateProductRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  const bodySchema = criarProdutoInputSchema.omit({ orgId: true });

  app.post("/catalogo/produtos", async (request, reply) => {
    const { "x-org-id": orgId, "x-actor-id": actorId } = headersSchema.parse(request.headers);
    const body = bodySchema.parse(request.body);

    const useCase = new CriarProdutoUseCase({
      produtoRepository: deps.produtoRepository,
      actorId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({ orgId, ...body });

    return reply.status(201).send(resultado);
  });
}
