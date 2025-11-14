import {
  ListarPrefichasUseCase,
  listarPrefichasInputSchema,
} from "@morina/preficha-application";
import type { PrefichaRepository } from "@morina/preficha-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

const querySchema = z.object({
  status: listarPrefichasInputSchema.shape.status.optional(),
  produtoId: z.string().optional(),
  busca: z.string().min(2).max(120).optional(),
  cursor: z.string().optional(),
  limite: z.coerce.number().int().min(1).max(50).optional(),
});

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
};

export async function registerListPrefichasRoute(
  app: FastifyInstance,
  deps: PrefichaHttpDeps,
) {
  app.get("/preficha", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const query = querySchema.parse(request.query ?? {});

    const useCase = new ListarPrefichasUseCase({
      prefichaRepository: deps.prefichaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });
}


