import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParams } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { PreFichaTecnicaRepository } from "./domain/repositories/pre-ficha-tecnica.repository";
import { registerPreFichaTecnicaRoutes } from "./http";
import { PrismaPreFichaTecnicaRepository } from "./infra/prisma/prisma-pre-ficha-tecnica.repository";

export type PreFichaTecnicaModuleOptions = {
  preFichaTecnicaRepository?: PreFichaTecnicaRepository;
  organizationRepository?: OrganizationRepository;
  eventBus?: DomainEventBus;
};

export async function registerPreFichaTecnicaModule(
  app: FastifyInstance,
  options: PreFichaTecnicaModuleOptions = {},
) {
  const preFichaTecnicaRepository =
    options.preFichaTecnicaRepository ??
    (process.env.DATABASE_URL ? new PrismaPreFichaTecnicaRepository() : undefined);

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.notifications" })
      : undefined);

  // Aplicar hook de tenant nas rotas de pré-fichas técnicas
  if (options.organizationRepository && preFichaTecnicaRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParams,
      routes: [/^\/organizations\/[^/]+\/pre-fichas-tecnicas/], // Regex para corresponder às rotas de pré-fichas técnicas
    });
  }

  // Registrar rotas HTTP
  if (preFichaTecnicaRepository) {
    await registerPreFichaTecnicaRoutes(app, {
      preFichaTecnicaRepository,
      eventBus,
    });
  }

  app.log.info("✅ Módulo Pré-Fichas Técnicas (Moldes Liberados) registrado");

  return {
    preFichaTecnicaRepository,
    eventBus,
  };
}











