import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { RedisEventBus } from "../../infra/events/redis-event-bus";
import { InMemoryOrganizationRepository } from "../organizations/infra/memory/in-memory-organization.repository";
import { InMemoryOrganizationAuditLogRepository } from "../organizations/infra/memory/in-memory-organization-audit-log.repository";
import { InMemoryUserInviteRepository } from "../organizations/infra/memory/in-memory-user-invite.repository";
import { PrismaOrganizationRepository } from "../organizations/infra/prisma/prisma-organization.repository";
import { PrismaOrganizationAuditLogRepository } from "../organizations/infra/prisma/prisma-organization-audit-log.repository";
import { PrismaUserInviteRepository } from "../organizations/infra/prisma/prisma-user-invite.repository";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../organizations/repositories/organization-audit-log.repository";
import type { UserInviteRepository } from "../organizations/repositories/user-invite.repository";
import { InMemoryUserRepository } from "../users/infra/memory/in-memory-user.repository";
import { PrismaUserRepository } from "../users/infra/prisma/prisma-user.repository";
import type { UserRepository } from "../users/repositories/user.repository";
import { registerLoginRoute } from "./http/login.route";
import { registerLogoutRoute } from "./http/logout.route";
import { registerLogoutAllRoute } from "./http/logout-all.route";
import { registerLogoutSessionRoute } from "./http/logout-session.route";
import { registerRefreshTokenRoute } from "./http/refresh-token.route";
import { registerRegisterRoute } from "./http/register.route";

export type AuthModuleOptions = {
  userRepository?: UserRepository;
  organizationRepository?: OrganizationRepository;
  inviteRepository?: UserInviteRepository;
  auditRepository?: OrganizationAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerAuthModule(app: FastifyInstance, options: AuthModuleOptions = {}) {
  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : new InMemoryUserRepository());

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

  await registerRegisterRoute(app, {
    userRepository,
    organizationRepository,
    inviteRepository,
    auditRepository,
  });

  const { SessionManagementService } = await import("./domain/services/session-management.service");
  // @ts-expect-error - PrismaService incompatibilidade de tipos irrelevante para runtime
  const sessionService = new SessionManagementService(
    (process.env.DATABASE_URL ? new PrismaUserRepository() : {}) as any,
  ); // Hack temporário: O serviço espera PrismaService, mas aqui estamos instanciando manual.
  // CORREÇÃO: Vamos usar o getPrisma direto
  const { getPrisma } = await import("../../infra/database/prisma.service");
  const prisma = getPrisma();
  // @ts-expect-error
  const realSessionService = new SessionManagementService(prisma);

  await registerLoginRoute(app, {
    userRepository,
    organizationRepository,
    auditRepository,
    sessionService: realSessionService,
  });

  await registerRefreshTokenRoute(app);

  await registerLogoutRoute(app, {
    userRepository,
    auditRepository,
  });

  await registerLogoutAllRoute(app, {
    userRepository,
    auditRepository,
  });

  await registerLogoutSessionRoute(app, {
    userRepository,
    auditRepository,
  });

  const { registerOAuthRoutes } = await import("./http/oauth.routes");
  await registerOAuthRoutes(app, {
    userRepository,
    organizationRepository,
    sessionService: realSessionService,
  });
}
