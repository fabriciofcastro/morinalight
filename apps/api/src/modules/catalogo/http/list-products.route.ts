import { ListarProdutosUseCase, listarProdutosInputSchema } from "@morina/catalogo-application";
import type { ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

const querySchema = z.object({
  status: listarProdutosInputSchema.shape.status.optional(),
  busca: z.string().min(2).max(120).optional(),
  cursor: z.string().optional(),
  limite: z.coerce.number().int().min(1).max(50).optional(),
});

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
};

export async function registerListProductsRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  app.get("/catalogo/produtos", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const query = querySchema.parse(request.query ?? {});

    const useCase = new ListarProdutosUseCase({
      produtoRepository: deps.produtoRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });
}
