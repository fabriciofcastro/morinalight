import type { FastifyInstance } from "fastify";

import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromHeaders } from "../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { registerCompanySettingsRoutes } from "./company-settings.routes";
import { PrismaCompanySettingsRepository } from "./infra/prisma/prisma-company-settings.repository";
import { CachedCompanySettingsRepository } from "./repositories/cached-company-settings.repository";
import type { CompanySettingsRepository } from "./repositories/company-settings.repository";
import { InMemoryCompanySettingsRepository } from "./repositories/in-memory-company-settings.repository";
import { RedisCompanySettingsRepository } from "./repositories/redis-company-settings.repository";

export type CompanySettingsModuleOptions = {
  repository?: CompanySettingsRepository;
  organizationRepository?: OrganizationRepository;
};

export async function registerCompanySettingsModule(
  app: FastifyInstance,
  options: CompanySettingsModuleOptions = {},
) {
  const repository = options.repository ?? createDefaultRepository();

  // Aplicar hook de tenant nas rotas de company-settings se organizationRepository estiver disponível
  if (options.organizationRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromHeaders,
      routes: ["/company-settings"],
    });
  }

  await registerCompanySettingsRoutes(app, repository);
}

function createDefaultRepository(): CompanySettingsRepository {
  const hasDatabase = Boolean(env.DATABASE_URL);
  const hasRedis = Boolean(env.REDIS_URL);
  const redisUrl = env.REDIS_URL;

  if (hasDatabase) {
    const prismaRepository = new PrismaCompanySettingsRepository();
    if (hasRedis && redisUrl) {
      const redisRepository = new RedisCompanySettingsRepository(redisUrl);
      return new CachedCompanySettingsRepository(prismaRepository, redisRepository);
    }
    return prismaRepository;
  }

  if (hasRedis && redisUrl) {
    return new RedisCompanySettingsRepository(redisUrl);
  }

  return new InMemoryCompanySettingsRepository();
}
