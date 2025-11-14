import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParams } from "../../core/tenant/tenant.utils";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import { InMemoryUserRepository } from "../users/infra/memory/in-memory-user.repository";
import { PrismaUserRepository } from "../users/infra/prisma/prisma-user.repository";
import type { UserRepository } from "../users/repositories/user.repository";
import { registerCreateOrganizationRoute } from "./http/create-organization.route";
import { registerDeleteOrganizationRoute } from "./http/delete-organization.route";
import { registerListOrganizationsRoute } from "./http/list-organizations.route";
import { registerOrganizationInvitesRoutes } from "./http/organization-invites.routes";
import { registerOrganizationMembersRoutes } from "./http/organization-members.routes";
import { registerUpdateOrganizationRoute } from "./http/update-organization.route";
import { InMemoryOrganizationRepository } from "./infra/memory/in-memory-organization.repository";
import { InMemoryOrganizationAuditLogRepository } from "./infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryUserInviteRepository } from "./infra/memory/in-memory-user-invite.repository";
import { PrismaOrganizationRepository } from "./infra/prisma/prisma-organization.repository";
import { PrismaOrganizationAuditLogRepository } from "./infra/prisma/prisma-organization-audit-log.repository";
import { PrismaUserInviteRepository } from "./infra/prisma/prisma-user-invite.repository";
import type { OrganizationRepository } from "./repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "./repositories/organization-audit-log.repository";
import type { UserInviteRepository } from "./repositories/user-invite.repository";

export type OrganizationsModuleOptions = {
  organizationRepository?: OrganizationRepository;
  inviteRepository?: UserInviteRepository;
  userRepository?: UserRepository;
  auditRepository?: OrganizationAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerOrganizationsModule(
  app: FastifyInstance,
  options: OrganizationsModuleOptions = {},
) {
  const organizationRepository =
    options.organizationRepository ??
    (process.env.DATABASE_URL
      ? new PrismaOrganizationRepository()
      : new InMemoryOrganizationRepository());

  const inviteRepository =
    options.inviteRepository ??
    (process.env.DATABASE_URL
      ? new PrismaUserInviteRepository()
      : new InMemoryUserInviteRepository());

  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : new InMemoryUserRepository());

  const eventBus =
    options.eventBus ??
    (env.REDIS_URL
      ? new RedisEventBus({ url: env.REDIS_URL, realtimeStream: "realtime.notifications" })
      : undefined);

  const auditRepository =
    options.auditRepository ??
    (process.env.DATABASE_URL
      ? new PrismaOrganizationAuditLogRepository({ eventBus })
      : new InMemoryOrganizationAuditLogRepository({ eventBus }));

  // Aplicar hook de tenant nas rotas de organizações (members e invites)
  // Excluir /organizations (list) que não precisa de validação de tenant
  registerTenantHook(app, {
    organizationRepository,
    extractOrgId: extractOrgIdFromParams,
    routes: [/^\/organizations\/[^/]+/], // Regex para corresponder a /organizations/{orgId} e sub-rotas
  });

  await registerListOrganizationsRoute(app, { organizationRepository });
  await registerCreateOrganizationRoute(app, {
    organizationRepository,
    auditRepository,
  });
  await registerUpdateOrganizationRoute(app, {
    organizationRepository,
    auditRepository,
  });
  await registerDeleteOrganizationRoute(app, {
    organizationRepository,
    auditRepository,
  });
  await registerOrganizationInvitesRoutes(app, {
    organizationRepository,
    inviteRepository,
    userRepository,
    auditRepository,
  });
  await registerOrganizationMembersRoutes(app, {
    organizationRepository,
    userRepository,
    auditRepository,
  });

  return { organizationRepository };
}
