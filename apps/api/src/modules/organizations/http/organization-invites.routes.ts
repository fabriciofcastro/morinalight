import { randomBytes } from "node:crypto";

import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant, hasRole } from "../../../core/tenant/tenant.utils";
import type { UserRepository } from "../../users/repositories/user.repository";
import type { OrganizationRepository } from "../repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../repositories/organization-audit-log.repository";
import type { UserInviteRepository } from "../repositories/user-invite.repository";

const paramsSchema = z.object({
  orgId: z.string().min(1),
});

const createInviteBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "manager", "member", "viewer"]).default("member"),
  expiresInDays: z.coerce.number().int().min(1).max(90).optional(),
});

const listInvitesQuerySchema = z
  .object({
    status: z
      .union([
        z.enum(["pending", "accepted", "cancelled"]),
        z.array(z.enum(["pending", "accepted", "cancelled"])),
      ])
      .optional(),
  })
  .transform((value) => {
    if (!value.status) return { status: undefined };
    return {
      status: Array.isArray(value.status) ? value.status : [value.status],
    };
  });

const inviteIdParamsSchema = z.object({
  orgId: z.string().min(1),
  inviteId: z.string().min(1),
});

type OrganizationInvitesDeps = {
  organizationRepository: OrganizationRepository;
  inviteRepository: UserInviteRepository;
  userRepository: UserRepository;
  auditRepository: OrganizationAuditLogRepository;
};

const allowedRolesToInvite = new Set(["owner", "admin", "manager"]);

export async function registerOrganizationInvitesRoutes(
  app: FastifyInstance,
  deps: OrganizationInvitesDeps,
) {
  app.post("/organizations/:orgId/invites", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId } = paramsSchema.parse(request.params);
    const body = createInviteBodySchema.parse(request.body ?? {});

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    // Verificar se o usuário tem permissão para convidar (owner, admin ou manager)
    if (!hasRole(request, ["owner", "admin", "manager"])) {
      return reply
        .status(403)
        .send({ message: "Sem permissão para convidar membros nesta organização." });
    }

    const organization = await deps.organizationRepository.encontrarPorId?.(orgId);
    if (!organization) {
      return reply.status(404).send({ message: "Organização não encontrada." });
    }

    const normalizedEmail = body.email.toLowerCase();

    if (await isInvitingSelf(deps.userRepository, tenant.userId, normalizedEmail)) {
      return reply
        .status(400)
        .send({ message: "Não é possível enviar convite para o próprio e-mail." });
    }

    const existingUser = await deps.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      const existingMembership = await deps.organizationRepository.encontrarMembership?.(
        orgId,
        existingUser.userId,
      );
      if (existingMembership) {
        return reply.status(409).send({ message: "Usuário já faz parte da organização." });
      }
    }

    if (deps.inviteRepository.findPendingByEmail) {
      const existingInvite = await deps.inviteRepository.findPendingByEmail(orgId, normalizedEmail);
      if (existingInvite) {
        return reply
          .status(409)
          .send({ message: "Já existe um convite pendente para este e-mail." });
      }
    }

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const invite = await deps.inviteRepository.create?.({
      inviteId: randomBytes(16).toString("hex"),
      organizationId: orgId,
      email: normalizedEmail,
      role: body.role,
      token: randomBytes(24).toString("hex"),
      invitedById: tenant.userId,
      expiresAt,
    });

    if (!invite) {
      return reply.status(500).send({ message: "Repositório de convites não está configurado." });
    }

    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.convite.criado",
      actorId: tenant.userId,
      targetId: invite.inviteId,
      payload: {
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });

    return reply.status(201).send({ invite });
  });

  app.get("/organizations/:orgId/invites", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId } = paramsSchema.parse(request.params);
    const { status } = listInvitesQuerySchema.parse(request.query ?? {});

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    const invites = await deps.inviteRepository.listByOrganization(orgId, {
      status,
    });

    return reply.send({
      itens: invites,
    });
  });

  app.delete("/organizations/:orgId/invites/:inviteId", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { orgId, inviteId } = inviteIdParamsSchema.parse(request.params);

    // Verificar se o orgId do tenant corresponde ao orgId da rota
    if (tenant.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado. Você não tem permissão para acessar esta organização.",
      });
    }

    // Verificar se o usuário tem permissão para cancelar convites (owner, admin ou manager)
    if (!hasRole(request, ["owner", "admin", "manager"])) {
      return reply
        .status(403)
        .send({ message: "Sem permissão para cancelar convites nesta organização." });
    }

    const invite = await deps.inviteRepository.findById(inviteId);
    if (!invite || invite.organizationId !== orgId) {
      return reply.status(404).send({ message: "Convite não encontrado." });
    }

    if (invite.status !== "pending") {
      return reply
        .status(409)
        .send({ message: "Somente convites pendentes podem ser cancelados." });
    }

    await deps.inviteRepository.cancel(inviteId);

    await deps.auditRepository.registrar({
      orgId,
      action: "organizacao.convite.cancelado",
      actorId: tenant.userId,
      targetId: invite.inviteId,
      payload: {
        email: invite.email,
        role: invite.role,
      },
    });

    return reply.status(204).send();
  });
}

async function isInvitingSelf(
  userRepository: UserRepository,
  requesterId: string,
  email: string,
): Promise<boolean> {
  const requester = await userRepository.findById(requesterId);
  return requester?.email.toLowerCase() === email;
}
