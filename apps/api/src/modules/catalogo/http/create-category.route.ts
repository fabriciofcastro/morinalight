import { CriarCategoriaUseCase } from "@morina/catalogo-application";
import type { CategoryRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type CreateCategoryRouteDeps = {
  categoriaRepository: CategoryRepository;
};

export async function registerCreateCategoryRoute(
  app: FastifyInstance,
  deps: CreateCategoryRouteDeps,
) {
  app.post("/catalogo/categorias", async (request, reply) => {
    const tenant = getTenant(request);

    const body = z
      .object({
        name: z.string().min(1).max(180),
        slug: z.string().min(1).max(180),
        description: z.string().max(512).optional().nullable(),
        parentId: z.string().uuid().optional().nullable(),
        ordem: z.number().int().nonnegative().optional(),
        ativo: z.boolean().optional(),
      })
      .parse(request.body);

    const useCase = new CriarCategoriaUseCase({
      categoriaRepository: deps.categoriaRepository,
    });

    const categoria = await useCase.execute({
      orgId: tenant.orgId,
      ...body,
    });

    return reply.status(201).send(categoria);
  });
}

