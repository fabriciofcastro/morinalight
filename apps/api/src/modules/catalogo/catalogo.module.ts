import type {
  CategoryRepository,
  ProdutoAuditoriaRepository,
  ProductVariantRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";

import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";

import { env } from "../../core/config/env";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import { registerCatalogoHttp } from "./http";
import { PrismaCategoryRepository } from "./infra/prisma/prisma-category.repository";
import { PrismaProductVariantRepository } from "./infra/prisma/prisma-product-variant.repository";
import { PrismaProdutoRepository } from "./infra/prisma/prisma-produto.repository";
import { PrismaProdutoAuditoriaRepository } from "./infra/prisma/prisma-produto-auditoria.repository";

export type CatalogoModuleOptions = {
  produtoRepository?: ProdutoRepository;
  auditoriaRepository?: ProdutoAuditoriaRepository;
  categoriaRepository?: CategoryRepository;
  varianteRepository?: ProductVariantRepository;
  eventBus?: DomainEventBus;
  organizationRepository?: OrganizationRepository;
};

export async function registerCatalogoModule(
  app: FastifyInstance,
  options: CatalogoModuleOptions = {},
) {
  const produtoRepository =
    options.produtoRepository ?? new PrismaProdutoRepository();
  const auditoriaRepository =
    options.auditoriaRepository ?? new PrismaProdutoAuditoriaRepository();
  const categoriaRepository =
    options.categoriaRepository ??
    (process.env.DATABASE_URL ? new PrismaCategoryRepository() : undefined);
  const varianteRepository =
    options.varianteRepository ??
    (process.env.DATABASE_URL
      ? new PrismaProductVariantRepository()
      : undefined);
  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({
          url: env.REDIS_URL,
          realtimeStream: "realtime.catalogo",
        })
      : undefined);

  // Aplicar hook de tenant nas rotas de catálogo se organizationRepository estiver disponível
  if (options.organizationRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: ["/catalogo"],
    });
  }

  await registerCatalogoHttp(app, {
    produtoRepository,
    auditoriaRepository,
    categoriaRepository,
    varianteRepository,
    eventBus,
  });
}
