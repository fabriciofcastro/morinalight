import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParams } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { FichaCustoRepository } from "./domain/repositories/ficha-custo.repository";
import {
  registerAnexarBoletoFichaCustoRoute,
  registerApproveFichaCustoRoute,
  registerCreateFichaCustoRoute,
  registerCreateStatusCustomizadoRoute,
  registerDeleteStatusCustomizadoRoute,
  registerEnviarConferenciaFichaCustoRoute,
  registerGetFichaCustoRoute,
  registerListarAuditoriaFichaCustoRoute,
  registerListarBoletosFichaCustoRoute,
  registerListarVersoesFichaCustoRoute,
  registerListFichasCustoRoute,
  registerListStatusCustomizadoRoute,
  registerPagarBoletoFichaCustoRoute,
  registerRejectFichaCustoRoute,
  registerRemoverBoletoFichaCustoRoute,
  registerUpdateFichaCustoRoute,
  registerUpdateStatusCustomizadoRoute,
  registerUploadFichaCustoRoute,
} from "./http";
import { PrismaFichaCustoRepository } from "./infra/prisma/prisma-ficha-custo.repository";

export type FichasCustoModuleOptions = {
  fichaCustoRepository?: FichaCustoRepository;
  organizationRepository?: OrganizationRepository;
  eventBus?: DomainEventBus;
};

export async function registerFichasCustoModule(
  app: FastifyInstance,
  options: FichasCustoModuleOptions = {},
) {
  const fichaCustoRepository =
    options.fichaCustoRepository ??
    (process.env.DATABASE_URL ? new PrismaFichaCustoRepository() : undefined);

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.notifications" })
      : undefined);

  // Aplicar hook de tenant nas rotas de fichas de custo
  if (options.organizationRepository && fichaCustoRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParams,
      routes: [/^\/organizations\/[^/]+\/fichas-custo/], // Regex para corresponder às rotas de fichas de custo
    });
  }

  // Registrar rotas HTTP
  if (fichaCustoRepository) {
    await registerCreateFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerListFichasCustoRoute(app, {
      fichaCustoRepository,
    });

    await registerGetFichaCustoRoute(app, {
      fichaCustoRepository,
    });

    await registerUpdateFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerEnviarConferenciaFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerApproveFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerRejectFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    // Rotas de boletos
    await registerAnexarBoletoFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerListarBoletosFichaCustoRoute(app, {
      fichaCustoRepository,
    });

    await registerPagarBoletoFichaCustoRoute(app, {
      fichaCustoRepository,
      eventBus,
    });

    await registerRemoverBoletoFichaCustoRoute(app, {
      fichaCustoRepository,
    });

    // Rotas de versionamento e auditoria
    await registerListarVersoesFichaCustoRoute(app, {
      fichaCustoRepository,
    });

    await registerListarAuditoriaFichaCustoRoute(app, {
      fichaCustoRepository,
    });

    // Rota de upload
    await registerUploadFichaCustoRoute(app);

    // Rotas de status customizados
    await registerListStatusCustomizadoRoute(app);
    await registerCreateStatusCustomizadoRoute(app);
    await registerUpdateStatusCustomizadoRoute(app);
    await registerDeleteStatusCustomizadoRoute(app);
  }

  app.log.info("✅ Módulo Fichas de Custo de Aviamentos registrado");

  return {
    fichaCustoRepository,
    eventBus,
  };
}
