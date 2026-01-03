import type { FastifyInstance } from "fastify";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import {
  registerAddTrustedDeviceRoute,
  registerBulkActionUsersRoute,
  registerChangeUserPasswordRoute,
  registerCreateApiTokenRoute,
  registerCreateUserRoute,
  registerDeleteUserRoute,
  registerDisable2FARoute,
  registerEnable2FARoute,
  registerExportUsersRoute,
  registerForceUserLogoutRoute,
  registerGet2FAQRCodeRoute,
  registerGetApiTokenHistoryRoute,
  registerGetUserActivityRoute,
  registerGetUserAuditLogRoute,
  registerGetUserOrganizationsRoute,
  registerGetUserRoute,
  registerGetUserSessionsRoute,
  registerImportUsersRoute,
  registerListApiTokensRoute,
  registerListTrustedDevicesRoute,
  registerListUsersRoute,
  registerRemoveTrustedDeviceRoute,
  registerRevokeApiTokenRoute,
  registerRevokeUserSessionRoute,
  registerUpdateUserRoute,
} from "./http";
import { InMemoryUserRepository } from "./infra/memory/in-memory-user.repository";
import { PrismaUserRepository } from "./infra/prisma/prisma-user.repository";
import type { UserRepository } from "./repositories/user.repository";

export type UsersModuleOptions = {
  userRepository?: UserRepository;
  organizationRepository?: OrganizationRepository;
};

export async function registerUsersModule(app: FastifyInstance, options: UsersModuleOptions = {}) {
  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : new InMemoryUserRepository());

  // Rotas básicas
  await registerListUsersRoute(app, { userRepository });
  await registerCreateUserRoute(app, { userRepository });
  await registerGetUserRoute(app, { userRepository });
  await registerUpdateUserRoute(app, { userRepository });
  await registerDeleteUserRoute(app, { userRepository });

  // Rotas adicionais
  await registerGetUserActivityRoute(app, { userRepository });
  await registerGetUserSessionsRoute(app, { userRepository });
  await registerRevokeUserSessionRoute(app, { userRepository });
  await registerForceUserLogoutRoute(app, { userRepository });
  await registerGetUserAuditLogRoute(app, { userRepository });
  await registerGetUserOrganizationsRoute(app, {
    userRepository,
    organizationRepository: options.organizationRepository,
  });
  await registerChangeUserPasswordRoute(app, { userRepository });
  await registerImportUsersRoute(app, { userRepository });
  await registerExportUsersRoute(app, { userRepository });
  await registerBulkActionUsersRoute(app, { userRepository });
  await registerEnable2FARoute(app, { userRepository });
  await registerDisable2FARoute(app, { userRepository });
  await registerGet2FAQRCodeRoute(app, { userRepository });
  await registerListTrustedDevicesRoute(app);
  await registerAddTrustedDeviceRoute(app);
  await registerRemoveTrustedDeviceRoute(app);
  await registerListApiTokensRoute(app);
  await registerCreateApiTokenRoute(app);
  await registerRevokeApiTokenRoute(app);
  await registerGetApiTokenHistoryRoute(app);

  app.log.info("✅ Módulo Users registrado com todas as rotas");

  return { userRepository };
}
