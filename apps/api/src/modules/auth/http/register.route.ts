import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../../../core/config/env";
import { slugify } from "../../../utils/slugify";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserInviteRepository } from "../../organizations/repositories/user-invite.repository";
import type { UserRepository } from "../../users/repositories/user.repository";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2).max(120),
    organizationName: z.string().min(3).max(180).optional(),
    inviteToken: z.string().min(16).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.inviteToken && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationName"],
        message: "organizationName é obrigatório quando inviteToken não é informado",
      });
    }
  });

type RegisterRouteDeps = {
  userRepository: UserRepository;
  organizationRepository: OrganizationRepository;
  inviteRepository: UserInviteRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerRegisterRoute(app: FastifyInstance, deps: RegisterRouteDeps) {
  app.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const email = body.email.toLowerCase();
    const existingUser = await deps.userRepository.findByEmail(email);
    if (existingUser) {
      return reply.status(409).send({
        message: "Usuário já cadastrado",
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const userId = randomUUID();

    let organizationId: string;
    let organizationName: string;
    let role = "owner";

    let inviteTokenRecord: { inviteId: string; email: string; role: string } | null = null;

    if (body.inviteToken) {
      const invite = await deps.inviteRepository.findByToken(body.inviteToken);
      if (!invite || invite.status !== "pending") {
        return reply.status(400).send({ message: "Convite inválido ou expirado." });
      }
      if (invite.email.toLowerCase() !== email) {
        return reply.status(400).send({
          message: "Convite não corresponde ao e-mail informado.",
        });
      }
      if (invite.expiresAt && invite.expiresAt < new Date()) {
        return reply.status(410).send({ message: "Convite expirado." });
      }

      const organization = await deps.organizationRepository.encontrarPorId?.(
        invite.organizationId,
      );
      if (!organization) {
        return reply.status(400).send({ message: "Organização do convite não encontrada." });
      }

      organizationId = invite.organizationId;
      organizationName = organization.name;
      role = invite.role;

      await deps.inviteRepository.markAccepted(invite.inviteId, userId, new Date());
      inviteTokenRecord = {
        inviteId: invite.inviteId,
        email: invite.email,
        role: invite.role,
      };
    } else {
      const organizationNameInput = body.organizationName ?? "";
      const { organizationId: idCreated, name } = await ensureOrganizationExists(
        deps.organizationRepository,
        organizationNameInput,
      );
      organizationId = idCreated;
      organizationName = name;
    }

    const user = await deps.userRepository.create({
      userId,
      email,
      passwordHash,
      displayName: body.displayName,
      status: "active",
    });

    if (!deps.organizationRepository.vincularUsuario) {
      throw new Error("Repositório de organização não suporta vincular usuário.");
    }

    await deps.organizationRepository.vincularUsuario(organizationId, user.userId, role);

    await deps.auditRepository.registrar({
      orgId: organizationId,
      action: body.inviteToken ? "organizacao.membro.convite_aceito" : "organizacao.membro.criado",
      actorId: user.userId,
      targetId: user.userId,
      payload: {
        email: user.email,
        displayName: user.displayName,
        role,
      },
    });

    if (inviteTokenRecord) {
      await deps.auditRepository.registrar({
        orgId: organizationId,
        action: "organizacao.convite.aceito",
        actorId: user.userId,
        targetId: inviteTokenRecord.inviteId,
        payload: {
          email: inviteTokenRecord.email,
          role: inviteTokenRecord.role,
        },
      });
    }

    const organizations = await deps.organizationRepository.listarPorUsuario(user.userId);

    const token = jwt.sign(
      {
        sub: user.userId,
        email: user.email,
        defaultOrgId: organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return reply.status(201).send({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
      },
      organization: {
        organizationId,
        name: organizationName,
        role,
      },
      organizations,
    });
  });
}

async function ensureOrganizationExists(
  repository: OrganizationRepository,
  name: string,
): Promise<{ organizationId: string; name: string; slug: string }> {
  const organizationId = randomUUID();
  if (!repository.criar || !repository.encontrarPorSlug) {
    throw new Error("Repositório de organização não suporta criação.");
  }

  const baseSlug = slugify(name) || `org-${organizationId.slice(0, 6)}`;
  let slugCandidate = baseSlug;
  let attempt = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await repository.encontrarPorSlug(slugCandidate);
    if (!existing) break;
    slugCandidate = `${baseSlug}-${attempt++}`;
  }

  const record = await repository.criar({
    organizationId,
    name,
    slug: slugCandidate,
  });

  return {
    organizationId: record.organizationId,
    name: record.name,
    slug: record.slug,
  };
}
