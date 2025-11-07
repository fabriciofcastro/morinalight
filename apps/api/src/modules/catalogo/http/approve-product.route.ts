import { AprovarProdutoUseCase, aprovarProdutoInputSchema } from "@morina/catalogo-application";
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

export async function registerApproveProductRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  const paramsSchema = aprovarProdutoInputSchema.pick({ produtoId: true });
  const bodySchema = aprovarProdutoInputSchema.pick({ motivo: true }).partial().default({});

  app.post("/catalogo/produtos/:produtoId/aprovar", async (request, reply) => {
    const { "x-org-id": orgId, "x-actor-id": actorId } = headersSchema.parse(request.headers);
    const { produtoId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});

    const useCase = new AprovarProdutoUseCase({
      produtoRepository: deps.produtoRepository,
      actorId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({ orgId, produtoId, motivo: body.motivo });

    return reply.status(200).send(resultado);
  });
}
