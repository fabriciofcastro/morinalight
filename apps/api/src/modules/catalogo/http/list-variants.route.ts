import { ListarVariantesUseCase } from "@morina/catalogo-application";
import type { ProductVariantRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type ListVariantsRouteDeps = {
  varianteRepository: ProductVariantRepository;
};

export async function registerListVariantsRoute(app: FastifyInstance, deps: ListVariantsRouteDeps) {
  app.get("/catalogo/variantes", async (request, reply) => {
    const tenant = getTenant(request);

    const query = z
      .object({
        productId: z.string().uuid().optional(),
        ativo: z.coerce.boolean().optional(),
        cursor: z.string().optional(),
        limite: z.coerce.number().int().min(1).max(50).optional(),
      })
      .parse(request.query);

    const useCase = new ListarVariantesUseCase({
      varianteRepository: deps.varianteRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });

  app.get("/catalogo/produtos/:productId/variantes", async (request, reply) => {
    const tenant = getTenant(request);
    const params = z
      .object({
        productId: z.string().uuid(),
      })
      .parse(request.params);

    const query = z
      .object({
        ativo: z.coerce.boolean().optional(),
        cursor: z.string().optional(),
        limite: z.coerce.number().int().min(1).max(50).optional(),
      })
      .parse(request.query);

    const useCase = new ListarVariantesUseCase({
      varianteRepository: deps.varianteRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      productId: params.productId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });
}
