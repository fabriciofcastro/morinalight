import type { FastifyInstance } from "fastify";

import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationRepository } from "../repositories/organization.repository";

type OrganizationsHttpDeps = {
  organizationRepository: OrganizationRepository;
};

export async function registerListOrganizationsRoute(
  app: FastifyInstance,
  deps: OrganizationsHttpDeps,
) {
  app.get("/organizations", async (request, reply) => {
    // Validar autenticação
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const organizations = await deps.organizationRepository.listarPorUsuario(request.auth.userId);

    return reply.send({ itens: organizations });
  });
}
