import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationRepository } from "../repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../repositories/organization-audit-log.repository";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
});

type CreateOrganizationDeps = {
  organizationRepository: OrganizationRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerCreateOrganizationRoute(
  app: FastifyInstance,
  deps: CreateOrganizationDeps,
) {
  app.post("/organizations", async (request, reply) => {
    // Validar autenticação
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const body = createOrganizationSchema.parse(request.body ?? {});

    if (!deps.organizationRepository.criar) {
      return reply.status(500).send({
        message: "Repositório de organizações não suporta criação",
      });
    }

    // Gerar slug a partir do nome
    const baseSlug = body.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let attempt = 1;

    // Verificar se slug já existe
    if (deps.organizationRepository.encontrarPorSlug) {
      while (await deps.organizationRepository.encontrarPorSlug(slug)) {
        slug = `${baseSlug}-${attempt++}`;
      }
    }

    const organizationId = randomUUID();

    const organization = await deps.organizationRepository.criar({
      organizationId,
      name: body.name,
      slug,
      description: body.description ?? null,
    });

    // Vincular o criador como owner
    if (deps.organizationRepository.vincularUsuario) {
      await deps.organizationRepository.vincularUsuario(organizationId, request.auth.userId, "owner");
    }

    // Registrar auditoria
    await deps.auditRepository.registrar({
      orgId: organizationId,
      action: "organizacao.criada",
      actorId: request.auth.userId,
      targetId: organizationId,
      payload: {
        name: organization.name,
        slug: organization.slug,
      },
    });

    return reply.status(201).send({ organization });
  });
}


