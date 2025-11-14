import { CriarVarianteUseCase } from "@morina/catalogo-application";
import type { ProductVariantRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type CreateVariantRouteDeps = {
  produtoRepository: ProdutoRepository;
  varianteRepository: ProductVariantRepository;
};

export async function registerCreateVariantRoute(
  app: FastifyInstance,
  deps: CreateVariantRouteDeps,
) {
  app.post("/catalogo/produtos/:productId/variantes", async (request, reply) => {
    const tenant = getTenant(request);
    const params = z
      .object({
        productId: z.string().uuid(),
      })
      .parse(request.params);

    const body = z
      .object({
        sku: z.string().min(1).max(100),
        nome: z.string().min(1).max(180),
        atributos: z.record(z.union([z.string(), z.number(), z.boolean()])),
        preco: z.number().nonnegative().optional().nullable(),
        estoque: z.number().int().nonnegative().optional().nullable(),
        ativo: z.boolean().optional(),
      })
      .parse(request.body);

    const useCase = new CriarVarianteUseCase({
      produtoRepository: deps.produtoRepository,
      varianteRepository: deps.varianteRepository,
      actorId: tenant.userId,
    });

    const variante = await useCase.execute({
      orgId: tenant.orgId,
      productId: params.productId,
      ...body,
    });

    return reply.status(201).send(variante);
  });
}
