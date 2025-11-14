import {
  EncaminharPrefichaUseCase,
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
import type { PrefichaNotificationService } from "../infra/notifications/preficha-notification.service";

const bodySchema = z.object({
  produtoId: z.string().min(1),
  aprovadoresIds: z.array(z.string().min(1)).min(1, "É necessário pelo menos um aprovador"),
});

const paramsSchema = z.object({
  prefichaId: z.string().min(1),
});

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
  notificationService?: PrefichaNotificationService;
};

export async function registerEncaminharPrefichaRoute(
  app: FastifyInstance,
  deps: PrefichaHttpDeps,
) {
  app.post("/preficha/:prefichaId/encaminhar", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { prefichaId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});

    // Buscar preficha existente
    const preficha = await deps.prefichaRepository.encontrarPorId(tenant.orgId, prefichaId);
    if (!preficha) {
      return reply.status(404).send({ message: "Preficha não encontrada" });
    }

    const useCase = new EncaminharPrefichaUseCase({
      prefichaRepository: deps.prefichaRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      produtoId: body.produtoId,
      aprovadoresIds: body.aprovadoresIds,
    });

    // Notificar aprovadores
    if (deps.notificationService) {
      await deps.notificationService.notificarAprovadores(
        tenant.orgId,
        resultado.prefichaId,
        body.produtoId,
        body.aprovadoresIds,
        tenant.userId,
      );
    }

    return reply.status(200).send(resultado);
  });
}


