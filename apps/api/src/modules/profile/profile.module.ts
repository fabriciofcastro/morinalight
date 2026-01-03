import type { FastifyInstance } from "fastify";
import { InMemoryUserRepository } from "../users/infra/memory/in-memory-user.repository";
import { PrismaUserRepository } from "../users/infra/prisma/prisma-user.repository";
import type { UserRepository } from "../users/repositories/user.repository";
import {
  registerChangeProfilePasswordRoute,
  registerGetProfileActivityRoute,
  registerGetProfileRoute,
  registerGetProfileSessionsRoute,
  registerGetProfileStatsRoute,
  registerRevokeProfileSessionRoute,
  registerUpdateProfileRoute,
  registerUploadAvatarRoute,
} from "./http";

export type ProfileModuleOptions = {
  userRepository?: UserRepository;
};

export async function registerProfileModule(
  app: FastifyInstance,
  options: ProfileModuleOptions = {},
) {
  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : new InMemoryUserRepository());

  await registerGetProfileRoute(app, { userRepository });
  await registerUpdateProfileRoute(app, { userRepository });
  await registerUploadAvatarRoute(app, { userRepository });
  await registerGetProfileActivityRoute(app, { userRepository });
  await registerGetProfileStatsRoute(app, { userRepository });
  await registerChangeProfilePasswordRoute(app, { userRepository });
  await registerGetProfileSessionsRoute(app, { userRepository });
  await registerRevokeProfileSessionRoute(app, { userRepository });

  app.log.info("✅ Módulo Profile registrado com todas as rotas");

  return { userRepository };
}
