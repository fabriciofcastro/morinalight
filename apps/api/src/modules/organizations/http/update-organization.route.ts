import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireOrganizationAccess } from "../../../core/auth/rbac.guards";
import type { OrganizationRepository } from "../repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../repositories/organization-audit-log.repository";

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  legalName: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

type UpdateOrganizationDeps = {
  organizationRepository: OrganizationRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerUpdateOrganizationRoute(
  app: FastifyInstance,
  deps: UpdateOrganizationDeps,
) {
  app.put("/organizations/:orgId", async (request, reply) => {
    // Validar autenticação e acesso (requer admin ou owner)
    await requireOrganizationAccess(deps.organizationRepository, "admin")(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { orgId } = z.object({ orgId: z.string().min(1) }).parse(request.params);
    const body = updateOrganizationSchema.parse(request.body ?? {});

    const organization = await deps.organizationRepository.encontrarPorId?.(orgId);
    if (!organization) {
      return reply.status(404).send({
        message: "Organização não encontrada",
      });
    }

    if (!deps.organizationRepository.atualizar) {
      return reply.status(500).send({
        message: "Repositório de organizações não suporta atualização",
      });
    }

    const updated = await deps.organizationRepository.atualizar({
      organizationId: orgId,
      name: body.name,
      description: body.description,
      legalName: body.legalName,
      cnpj: body.cnpj,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
    });

    if (!updated) {
      return reply.status(500).send({
        message: "Falha ao atualizar organização",
      });
    }

    // Registrar auditoria
    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.atualizada",
      actorId: request.auth.userId,
      targetId: orgId,
      payload: {
        changes: body,
      },
    });

    return reply.send({ organization: updated });
  });
}
