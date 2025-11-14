import type { FastifyInstance } from "fastify";
import { registerCreateUserRoute } from "./http/create-user.route";
import { registerDeleteUserRoute } from "./http/delete-user.route";
import { registerListUsersRoute } from "./http/list-users.route";
import { registerUpdateUserRoute } from "./http/update-user.route";
import { InMemoryUserRepository } from "./infra/memory/in-memory-user.repository";
import { PrismaUserRepository } from "./infra/prisma/prisma-user.repository";
import type { UserRepository } from "./repositories/user.repository";

export type UsersModuleOptions = {
  userRepository?: UserRepository;
};

export async function registerUsersModule(app: FastifyInstance, options: UsersModuleOptions = {}) {
  const userRepository =
    options.userRepository ??
    (process.env.DATABASE_URL ? new PrismaUserRepository() : new InMemoryUserRepository());

  await registerListUsersRoute(app, { userRepository });
  await registerCreateUserRoute(app, { userRepository });
  await registerUpdateUserRoute(app, { userRepository });
  await registerDeleteUserRoute(app, { userRepository });

  return { userRepository };
}
