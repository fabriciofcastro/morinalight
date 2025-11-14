import type { FastifyInstance } from "fastify";
import type { OrganizationRepository } from "../../modules/organizations/repositories/organization.repository";
import { registerJwtMiddleware } from "./jwt.middleware";

export type AuthModuleOptions = {
  organizationRepository?: OrganizationRepository;
  excludeRoutes?: Array<string | RegExp>;
};

/**
 * Registra o módulo de autenticação JWT
 */
export async function registerAuthModule(
  app: FastifyInstance,
  options: AuthModuleOptions = {},
) {
  const { excludeRoutes } = options;

  // Rotas públicas que não precisam de autenticação
  const defaultExcludeRoutes: Array<string | RegExp> = [
    "/health",
    "/auth/login",
    "/auth/register",
    /^\/docs/,
    /^\/swagger/,
    ...(excludeRoutes || []),
  ];

  registerJwtMiddleware(app, {
    excludeRoutes: defaultExcludeRoutes,
  });

  app.log.info("Módulo de autenticação JWT registrado");
}

