import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireOrganizationAccess } from "../../../core/auth/rbac.guards";
import type { OrganizationRepository } from "../repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../repositories/organization-audit-log.repository";

type DeleteOrganizationDeps = {
  organizationRepository: OrganizationRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerDeleteOrganizationRoute(
  app: FastifyInstance,
  deps: DeleteOrganizationDeps,
) {
  app.delete("/organizations/:orgId", async (request, reply) => {
    // Validar autenticação e acesso (requer owner)
    await requireOrganizationAccess(deps.organizationRepository, "owner")(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { orgId } = z.object({ orgId: z.string().min(1) }).parse(request.params);

    const organization = await deps.organizationRepository.encontrarPorId?.(orgId);
    if (!organization) {
      return reply.status(404).send({
        message: "Organização não encontrada",
      });
    }

    if (!deps.organizationRepository.deletar) {
      return reply.status(500).send({
        message: "Repositório de organizações não suporta exclusão",
      });
    }

    // Registrar auditoria antes de deletar
    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.deletada",
      actorId: request.auth.userId,
      targetId: orgId,
      payload: {
        name: organization.name,
      },
    });

    await deps.organizationRepository.deletar(orgId);

    return reply.status(204).send();
  });
}
