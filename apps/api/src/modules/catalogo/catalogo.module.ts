import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";

import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";

import { env } from "../../core/config/env";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import { registerCatalogoHttp } from "./http";
import { PrismaProdutoRepository } from "./infra/prisma/prisma-produto.repository";
import { PrismaProdutoAuditoriaRepository } from "./infra/prisma/prisma-produto-auditoria.repository";

export type CatalogoModuleOptions = {
  produtoRepository?: ProdutoRepository;
  auditoriaRepository?: ProdutoAuditoriaRepository;
  eventBus?: DomainEventBus;
};

export async function registerCatalogoModule(
  app: FastifyInstance,
  options: CatalogoModuleOptions = {},
) {
  const produtoRepository = options.produtoRepository ?? new PrismaProdutoRepository();
  const auditoriaRepository = options.auditoriaRepository ?? new PrismaProdutoAuditoriaRepository();
  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.catalogo" })
      : undefined);

  await registerCatalogoHttp(app, { produtoRepository, auditoriaRepository, eventBus });
}
