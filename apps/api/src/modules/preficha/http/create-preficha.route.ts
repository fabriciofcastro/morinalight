import {
  CriarPrefichaUseCase,
  criarPrefichaInputSchema,
} from "@morina/preficha-application";
import type {
  PrefichaAuditoriaRepository,
  PrefichaRepository,
} from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

const bodySchema = criarPrefichaInputSchema.omit({ orgId: true });

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
};

export async function registerCreatePrefichaRoute(
  app: FastifyInstance,
  deps: PrefichaHttpDeps,
) {
  app.post("/preficha", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const body = bodySchema.parse(request.body);

    const useCase = new CriarPrefichaUseCase({
      prefichaRepository: deps.prefichaRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({ orgId: tenant.orgId, ...body });

    return reply.status(201).send(resultado);
  });
}


