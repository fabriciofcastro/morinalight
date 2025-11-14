import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { FastifyInstance } from "fastify";

import { PrismaProdutoRepository } from "../catalogo/infra/prisma/prisma-produto.repository";
import { PrismaProdutoAuditoriaRepository } from "../catalogo/infra/prisma/prisma-produto-auditoria.repository";
import { PrismaOrganizationAuditLogRepository } from "../organizations/infra/prisma/prisma-organization-audit-log.repository";
import type { OrganizationAuditLogRepository } from "../organizations/repositories/organization-audit-log.repository";
import { PrismaPrefichaRepository } from "../preficha/infra/prisma/prisma-preficha.repository";
import { PrismaPrefichaAuditoriaRepository } from "../preficha/infra/prisma/prisma-preficha-auditoria.repository";
import { registerNotificationsRoutes } from "./notifications.routes";

export type NotificationsModuleOptions = {
  produtoRepository?: ProdutoRepository;
  auditoriaRepository?: ProdutoAuditoriaRepository;
  organizationAuditRepository?: OrganizationAuditLogRepository;
  prefichaRepository?: PrefichaRepository;
  prefichaAuditoriaRepository?: PrefichaAuditoriaRepository;
};

export async function registerNotificationsModule(
  app: FastifyInstance,
  options: NotificationsModuleOptions = {},
) {
  const produtoRepository = options.produtoRepository ?? new PrismaProdutoRepository();
  const auditoriaRepository = options.auditoriaRepository ?? new PrismaProdutoAuditoriaRepository();
  const organizationAuditRepository =
    options.organizationAuditRepository ?? new PrismaOrganizationAuditLogRepository();
  const prefichaRepository =
    options.prefichaRepository ??
    (process.env.DATABASE_URL ? new PrismaPrefichaRepository() : undefined);
  const prefichaAuditoriaRepository =
    options.prefichaAuditoriaRepository ??
    (process.env.DATABASE_URL ? new PrismaPrefichaAuditoriaRepository() : undefined);

  await registerNotificationsRoutes(app, {
    produtoRepository,
    auditoriaRepository,
    organizationAuditRepository,
    prefichaRepository,
    prefichaAuditoriaRepository,
  });
}
