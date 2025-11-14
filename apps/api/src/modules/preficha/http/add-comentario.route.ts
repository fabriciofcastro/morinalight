import {
  AdicionarComentarioUseCase,
  adicionarComentarioInputSchema,
} from "@morina/preficha-application";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";
import type { PrefichaNotificationService } from "../infra/notifications/preficha-notification.service";

const bodySchema = z.object({
  comentario: z.string().min(1, "Comentário não pode ser vazio"),
});

const paramsSchema = adicionarComentarioInputSchema.pick({ prefichaId: true });

type PrefichaHttpDeps = {
  prefichaRepository: PrefichaRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: PrefichaAuditoriaRepository;
  notificationService?: PrefichaNotificationService;
};

export async function registerAddComentarioRoute(app: FastifyInstance, deps: PrefichaHttpDeps) {
  app.post("/preficha/:prefichaId/comentarios", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { prefichaId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});

    const useCase = new AdicionarComentarioUseCase({
      prefichaRepository: deps.prefichaRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      prefichaId,
      comentario: body.comentario,
    });

    // Notificar comentário (notificar outros aprovadores se a preficha estiver pendente)
    if (deps.notificationService && resultado.status === "pendente_aprovacao") {
      const outrosAprovadores = resultado.aprovadores
        .filter((a) => a.userId !== tenant.userId)
        .map((a) => a.userId);

      if (outrosAprovadores.length > 0) {
        await Promise.all(
          outrosAprovadores.map((aprovadorId) =>
            deps.notificationService?.notificarComentario(
              tenant.orgId,
              resultado.prefichaId,
              resultado.produtoId,
              body.comentario,
              tenant.userId,
              aprovadorId,
            ),
          ),
        );
      }
    }

    return reply.status(200).send(resultado);
  });
}
