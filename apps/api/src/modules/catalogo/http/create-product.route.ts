import { CriarProdutoUseCase, criarProdutoInputSchema } from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";

import { getTenant } from "../../../core/tenant/tenant.utils";

const bodySchema = criarProdutoInputSchema.omit({ orgId: true });

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export async function registerCreateProductRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  app.post("/catalogo/produtos", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const body = bodySchema.parse(request.body);

    const useCase = new CriarProdutoUseCase({
      produtoRepository: deps.produtoRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({ orgId: tenant.orgId, ...body });

    return reply.status(201).send(resultado);
  });
}
