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

  await registerLoginRoute(app, {
    userRepository,
    organizationRepository,
    auditRepository,
  });
}
