import { ListarCategoriasUseCase } from "@morina/catalogo-application";
import type { CategoryRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type ListCategoriesRouteDeps = {
  categoriaRepository: CategoryRepository;
};

export async function registerListCategoriesRoute(
  app: FastifyInstance,
  deps: ListCategoriesRouteDeps,
) {
  app.get("/catalogo/categorias", async (request, reply) => {
    const tenant = getTenant(request);

    const query = z
      .object({
        parentId: z.string().uuid().nullable().optional(),
        ativo: z.coerce.boolean().optional(),
        cursor: z.string().optional(),
        limite: z.coerce.number().int().min(1).max(50).optional(),
      })
      .parse(request.query);

    const useCase = new ListarCategoriasUseCase({
      categoriaRepository: deps.categoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });
}
