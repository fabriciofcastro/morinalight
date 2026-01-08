import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import type { FastifyInstance } from "fastify";

import { PrismaProdutoRepository } from "../catalogo/infra/prisma/prisma-produto.repository";
import { PrismaProdutoAuditoriaRepository } from "../catalogo/infra/prisma/prisma-produto-auditoria.repository";
import { PrismaOrganizationAuditLogRepository } from "../organizations/infra/prisma/prisma-organization-audit-log.repository";
import type { OrganizationAuditLogRepository } from "../organizations/repositories/organization-audit-log.repository";
import { PrismaPrefichaRepository } from "../preficha/infra/prisma/prisma-preficha.repository";
import { PrismaPrefichaAuditoriaRepository } from "../preficha/infra/prisma/prisma-preficha-auditoria.repository";
import {
  registerBulkActionNotificationsRoute,
  registerCreateNotificationRoute,
  registerDeleteNotificationRoute,
  registerGetNotificationHistoryRoute,
  registerGetNotificationPreferencesRoute,
  registerGetNotificationRoute,
  registerGetNotificationStatsRoute,
  registerListNotificationsRoute,
  registerMarkAllReadRoute,
  registerMarkNotificationReadRoute,
  registerMarkNotificationUnreadRoute,
  registerTestNotificationRoute,
  registerUpdateNotificationPreferencesRoute,
  registerUpdateNotificationRoute,
} from "./http";
import { PrismaNotificationRepository } from "./infra/prisma/prisma-notification.repository";
import { registerNotificationsRoutes } from "./notifications.routes";

export type NotificationsModuleOptions = {
  produtoRepository?: ProdutoRepository;
  auditoriaRepository?: ProdutoAuditoriaRepository;
  organizationAuditRepository?: OrganizationAuditLogRepository;
  prefichaRepository?: PrefichaRepository;
  prefichaAuditoriaRepository?: PrefichaAuditoriaRepository;
  notificationRepository?: PrismaNotificationRepository;
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
  const notificationRepository =
    options.notificationRepository ?? new PrismaNotificationRepository();

  // Rotas do feed de notificações (baseado em auditoria)
  await registerNotificationsRoutes(app, {
    produtoRepository,
    auditoriaRepository,
    organizationAuditRepository,
    prefichaRepository,
    prefichaAuditoriaRepository,
  });

  // Rotas CRUD de notificações
  await registerListNotificationsRoute(app, { notificationRepository });
  await registerCreateNotificationRoute(app, { notificationRepository });
  await registerGetNotificationRoute(app, { notificationRepository });
  await registerUpdateNotificationRoute(app, { notificationRepository });
  await registerDeleteNotificationRoute(app, { notificationRepository });
  await registerMarkNotificationReadRoute(app, { notificationRepository });
  await registerMarkNotificationUnreadRoute(app, { notificationRepository });
  await registerMarkAllReadRoute(app, { notificationRepository });
  await registerGetNotificationStatsRoute(app, { notificationRepository });
  await registerGetNotificationHistoryRoute(app, { notificationRepository });
  await registerGetNotificationPreferencesRoute(app);
  await registerUpdateNotificationPreferencesRoute(app);
  await registerTestNotificationRoute(app, { notificationRepository });
  await registerBulkActionNotificationsRoute(app, { notificationRepository });

  app.log.info("✅ Módulo Notifications registrado com todas as rotas CRUD");
}
