import type {
  PrefichaAuditoriaRepository,
  PrefichaRepository,
} from "@morina/preficha-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromHeaders } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import {
  registerAddComentarioRoute,
  registerApprovePrefichaRoute,
  registerCreatePrefichaRoute,
  registerEncaminharPrefichaRoute,
  registerGetPrefichaRoute,
  registerListPrefichasRoute,
  registerRejectPrefichaRoute,
} from "./http";
import { InMemoryPrefichaAuditoriaRepository } from "./infra/memory/in-memory-preficha-auditoria.repository";
import { InMemoryPrefichaRepository } from "./infra/memory/in-memory-preficha.repository";
import { PrefichaNotificationService } from "./infra/notifications/preficha-notification.service";

export type PrefichaModuleOptions = {
  prefichaRepository?: PrefichaRepository;
  auditoriaRepository?: PrefichaAuditoriaRepository;
  eventBus?: DomainEventBus;
  organizationRepository?: OrganizationRepository;
};

export async function registerPrefichaModule(
  app: FastifyInstance,
  options: PrefichaModuleOptions = {},
) {
  const prefichaRepository =
    options.prefichaRepository ??
    (process.env.DATABASE_URL
      ? await createPrismaPrefichaRepository()
      : new InMemoryPrefichaRepository());

  const auditoriaRepository =
    options.auditoriaRepository ??
    (process.env.DATABASE_URL
      ? await createPrismaPrefichaAuditoriaRepository()
      : new InMemoryPrefichaAuditoriaRepository());

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.notifications" })
      : undefined);

  // Criar serviço de notificações
  const notificationService = new PrefichaNotificationService(eventBus);

  // Aplicar hook de tenant nas rotas de preficha se organizationRepository estiver disponível
  if (options.organizationRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromHeaders,
      routes: ["/preficha"],
    });
  }

  // Registrar rotas
  await registerCreatePrefichaRoute(app, {
    prefichaRepository,
    auditoriaRepository,
    eventBus,
  });

  await registerListPrefichasRoute(app, {
    prefichaRepository,
  });

  await registerGetPrefichaRoute(app, {
    prefichaRepository,
  });

  await registerEncaminharPrefichaRoute(app, {
    prefichaRepository,
    auditoriaRepository,
    eventBus,
    notificationService,
  });

  await registerApprovePrefichaRoute(app, {
    prefichaRepository,
    auditoriaRepository,
    eventBus,
    notificationService,
  });

  await registerRejectPrefichaRoute(app, {
    prefichaRepository,
    auditoriaRepository,
    eventBus,
    notificationService,
  });

  await registerAddComentarioRoute(app, {
    prefichaRepository,
    auditoriaRepository,
    eventBus,
    notificationService,
  });

  app.log.info("Módulo Preficha registrado");

  return {
    prefichaRepository,
    auditoriaRepository,
  };
}

async function createPrismaPrefichaRepository(): Promise<PrefichaRepository> {
  const { PrismaPrefichaRepository } = await import("./infra/prisma/prisma-preficha.repository");
  return new PrismaPrefichaRepository();
}

async function createPrismaPrefichaAuditoriaRepository(): Promise<PrefichaAuditoriaRepository> {
  const { PrismaPrefichaAuditoriaRepository } = await import(
    "./infra/prisma/prisma-preficha-auditoria.repository"
  );
  return new PrismaPrefichaAuditoriaRepository();
}

