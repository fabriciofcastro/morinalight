import { RejeitarPrefichaUseCase, rejeitarPrefichaInputSchema } from "@morina/preficha-application";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";
import type { PrefichaNotificationService } from "../infra/notifications/preficha-notification.service";

const bodySchema = z.object({
  motivo: z.string().min(1, "Motivo da rejeição é obrigatório"),
});

const paramsSchema = rejeitarPrefichaInputSchema.pick({ prefichaId: true });

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
  notificationService?: PrefichaNotificationService;
};

export async function registerRejectPrefichaRoute(app: FastifyInstance, deps: PrefichaHttpDeps) {
  app.post("/preficha/:prefichaId/rejeitar", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { prefichaId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});

    const useCase = new RejeitarPrefichaUseCase({
      prefichaRepository: deps.prefichaRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      prefichaId,
      motivo: body.motivo,
    });

    // Notificar rejeição
    if (deps.notificationService) {
      await deps.notificationService.notificarRejeicao(
        tenant.orgId,
        resultado.prefichaId,
        resultado.produtoId,
        body.motivo,
        tenant.userId,
        tenant.userId,
      );
    }

    return reply.status(200).send(resultado);
  });
}
