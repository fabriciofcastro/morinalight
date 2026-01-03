import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
  organizationRepository?: OrganizationRepository;
};

export async function registerGetUserOrganizationsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/users/:userId/organizations",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

      // Verificar se usuário existe
      const user = await deps.userRepository.findById(userId);
      if (!user) {
        return reply.status(404).send({
          message: "Usuário não encontrado",
        });
      }

      if (!deps.organizationRepository) {
        return reply.send({
          organizations: [],
          message: "Repositório de organizações não disponível",
        });
      }

      try {
        const organizations = await deps.organizationRepository.listarPorUsuario(userId);

        return reply.send({
          organizations: organizations.map((org) => ({
            id: org.organizationId,
            name: org.name,
            slug: org.slug,
            role: org.role || "member",
          })),
        });
      } catch (error) {
        app.log.error(error, "Erro ao listar organizações do usuário");
        return reply.status(500).send({
          message: "Erro ao listar organizações do usuário",
        });
      }
    },
  );
}
