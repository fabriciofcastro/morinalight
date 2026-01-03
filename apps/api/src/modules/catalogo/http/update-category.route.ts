import { AtualizarCategoriaUseCase } from "@morina/catalogo-application";
import type { CategoryRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type UpdateCategoryRouteDeps = {
  categoriaRepository: CategoryRepository;
};

export async function registerUpdateCategoryRoute(
  app: FastifyInstance,
  deps: UpdateCategoryRouteDeps,
) {
  app.put("/catalogo/categorias/:categoriaId", async (request, reply) => {
    const tenant = getTenant(request);
    const params = z
      .object({
        categoriaId: z.string().uuid(),
      })
      .parse(request.params);

    const body = z
      .object({
        name: z.string().min(1).max(180).optional(),
        description: z.string().max(512).optional().nullable(),
        parentId: z.string().uuid().optional().nullable(),
        ordem: z.number().int().nonnegative().optional(),
        ativo: z.boolean().optional(),
      })
      .parse(request.body);

    const useCase = new AtualizarCategoriaUseCase({
      categoriaRepository: deps.categoriaRepository,
    });

    const categoria = await useCase.execute({
      orgId: tenant.orgId,
      categoriaId: params.categoriaId,
      ...body,
    });

    return reply.status(200).send(categoria);
  });
}
