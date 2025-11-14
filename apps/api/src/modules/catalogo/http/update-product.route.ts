import { AtualizarProdutoUseCase } from "@morina/catalogo-application";
import type { ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type UpdateProductRouteDeps = {
  produtoRepository: ProdutoRepository;
};

export async function registerUpdateProductRoute(
  app: FastifyInstance,
  deps: UpdateProductRouteDeps,
) {
  app.put("/catalogo/produtos/:produtoId", async (request, reply) => {
    const tenant = getTenant(request);
    const params = z
      .object({
        produtoId: z.string().uuid(),
      })
      .parse(request.params);

    const body = z
      .object({
        nome: z.string().min(3).max(180).optional(),
        descricao: z.string().max(1024).optional().nullable(),
        sku: z.string().max(100).optional().nullable(),
        categoryId: z.string().uuid().optional().nullable(),
      })
      .parse(request.body);

    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: deps.produtoRepository,
      actorId: tenant.userId,
    });

    const produto = await useCase.execute({
      orgId: tenant.orgId,
      produtoId: params.produtoId,
      ...body,
    });

    return reply.status(200).send(produto);
  });
}

