import { ObterPrefichaUseCase, obterPrefichaInputSchema } from "@morina/preficha-application";
import type { PrefichaRepository } from "@morina/preficha-domain";
import type { FastifyInstance } from "fastify";

import { getTenant } from "../../../core/tenant/tenant.utils";

const paramsSchema = obterPrefichaInputSchema.pick({ prefichaId: true });

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
};

export async function registerGetPrefichaRoute(app: FastifyInstance, deps: PrefichaHttpDeps) {
  app.get("/preficha/:prefichaId", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { prefichaId } = paramsSchema.parse(request.params);

    const useCase = new ObterPrefichaUseCase({
      prefichaRepository: deps.prefichaRepository,
    });

    const resultado = await useCase.execute({ orgId: tenant.orgId, prefichaId });

    return reply.status(200).send(resultado);
  });
}
