import { ObterProdutoUseCase, obterProdutoInputSchema } from "@morina/catalogo-application";
import type { ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";

import { getTenant } from "../../../core/tenant/tenant.utils";

const paramsSchema = obterProdutoInputSchema.pick({ produtoId: true });

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
};

export async function registerGetProductRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  app.get("/catalogo/produtos/:produtoId", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { produtoId } = paramsSchema.parse(request.params);

    const useCase = new ObterProdutoUseCase({
      produtoRepository: deps.produtoRepository,
    });

    const resultado = await useCase.execute({ orgId: tenant.orgId, produtoId });

    return reply.status(200).send(resultado);
  });
}
