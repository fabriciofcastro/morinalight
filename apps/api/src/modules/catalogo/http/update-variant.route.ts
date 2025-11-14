import { AtualizarVarianteUseCase } from "@morina/catalogo-application";
import type { ProductVariantRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type UpdateVariantRouteDeps = {
  varianteRepository: ProductVariantRepository;
};

export async function registerUpdateVariantRoute(
  app: FastifyInstance,
  deps: UpdateVariantRouteDeps,
) {
  app.put("/catalogo/variantes/:varianteId", async (request, reply) => {
    const tenant = getTenant(request);
    const params = z
      .object({
        varianteId: z.string().uuid(),
      })
      .parse(request.params);

    const body = z
      .object({
        nome: z.string().min(1).max(180).optional(),
        atributos: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
        preco: z.number().nonnegative().optional().nullable(),
        estoque: z.number().int().nonnegative().optional().nullable(),
        ativo: z.boolean().optional(),
      })
      .parse(request.body);

    const useCase = new AtualizarVarianteUseCase({
      varianteRepository: deps.varianteRepository,
      actorId: tenant.userId,
    });

    const variante = await useCase.execute({
      orgId: tenant.orgId,
      varianteId: params.varianteId,
      ...body,
    });

    return reply.status(200).send(variante);
  });
}
