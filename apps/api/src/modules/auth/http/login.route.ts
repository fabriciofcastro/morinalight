import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../../../core/config/env";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserRepository } from "../../users/repositories/user.repository";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginRouteDeps = {
  userRepository: UserRepository;
  organizationRepository: OrganizationRepository;
  auditRepository: OrganizationAuditLogRepository;
};

export async function registerLoginRoute(app: FastifyInstance, deps: LoginRouteDeps) {
  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const email = body.email.toLowerCase();
    const user = await deps.userRepository.findByEmail(email);

    if (!user) {
      // Registrar tentativa de login com e-mail inexistente
      await deps.auditRepository.registrar({
        orgId: "system",
        action: "auth.login.tentativa_falha",
        actorId: "anonymous",
        targetId: null,
        payload: {
          email,
          reason: "usuario_nao_encontrado",
        },
      });

      return reply.status(401).send({ message: "Credenciais inválidas" });
    }

    if (user.status !== "active") {
      await deps.auditRepository.registrar({
        orgId: "system",
        action: "auth.login.tentativa_falha",
        actorId: user.userId,
        targetId: user.userId,
        payload: {
          email: user.email,
          reason: "usuario_inativo",
        },
      });

      return reply.status(403).send({ message: "Usuário inativo" });
    }

    const validPassword = await bcrypt.compare(body.password, user.passwordHash);
    if (!validPassword) {
      await deps.auditRepository.registrar({
        orgId: "system",
        action: "auth.login.tentativa_falha",
        actorId: user.userId,
        targetId: user.userId,
        payload: {
          email: user.email,
          reason: "senha_invalida",
        },
      });

      return reply.status(401).send({ message: "Credenciais inválidas" });
    }

    const organizations = await deps.organizationRepository.listarPorUsuario(user.userId);
    await deps.userRepository.setLastLogin(user.userId, new Date());

    const defaultOrgId = organizations[0]?.organizationId ?? null;

    // Registrar login bem-sucedido
    if (defaultOrgId) {
      await deps.auditRepository.registrar({
        orgId: defaultOrgId,
        action: "auth.login.sucesso",
        actorId: user.userId,
        targetId: user.userId,
        payload: {
          email: user.email,
          displayName: user.displayName,
        },
      });
    } else {
      // Se não houver organização, registrar no sistema
      await deps.auditRepository.registrar({
        orgId: "system",
        action: "auth.login.sucesso",
        actorId: user.userId,
        targetId: user.userId,
        payload: {
          email: user.email,
          displayName: user.displayName,
        },
      });
    }

    const token = jwt.sign(
      {
        sub: user.userId,
        email: user.email,
        defaultOrgId,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return reply.send({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
      },
      organizations,
    });
  });
}
