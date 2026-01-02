import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
import { z } from "zod";

import { signToken } from "../../../core/auth/jwt-rs256.service";
import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();
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
    // Log direto no console para debug
    console.log("🔵 [LOGIN] Requisição recebida:", {
      email: (request.body as { email?: string })?.email,
      hasPassword: !!(request.body as { password?: string })?.password,
    });

    app.log.info("=== INÍCIO DO LOGIN ===");
    try {
      app.log.info({ body: request.body, headers: request.headers }, "Recebida requisição de login");

      let body: z.infer<typeof loginSchema>;
      try {
        body = loginSchema.parse(request.body);
        app.log.info({ email: body.email, passwordLength: body.password.length }, "Schema validado");
      } catch (schemaError) {
        app.log.error({ error: schemaError, body: request.body }, "Erro na validação do schema");
        return reply.status(400).send({ message: "Dados inválidos", error: schemaError });
      }

      const email = body.email.toLowerCase().trim();
      app.log.info({ email, originalEmail: body.email }, "Tentativa de login - email normalizado");

      const Sentry = await import("@sentry/node");

      // Log do DATABASE_URL para debug
      if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL;
        const maskedUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
        app.log.info({ databaseUrl: maskedUrl }, "DATABASE_URL em uso");
      } else {
        app.log.warn("DATABASE_URL não encontrada em process.env");
      }

      const user = await deps.userRepository.findByEmail(email);
      console.log("🔵 [LOGIN] Usuário encontrado:", !!user, email);
      app.log.info({ found: !!user, email, userId: user?.userId }, "Resultado da busca do usuário");

      if (!user) {
        console.log("🔴 [LOGIN] Usuário NÃO encontrado:", email);
        app.log.warn({ email, searchedEmail: email }, "Usuário não encontrado");

        // Business Metric: User Not Found
        Sentry.withScope((scope) => {
          scope.setTag("auth.action", "login");
          scope.setTag("auth.status", "failure");
          scope.setTag("auth.reason", "user_not_found");
          Sentry.captureMessage("Login Failure: User not found", "info");
        });

        // Registrar tentativa de login com e-mail inexistente
        try {
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
        } catch (auditError) {
          app.log.error({ error: auditError }, "Erro ao registrar auditoria (ignorado)");
        }

        return reply.status(401).send({ message: "Credenciais inválidas" });
      }

      app.log.info({ userId: user.userId, status: user.status }, "Usuário encontrado");

      // Set user context for the rest of the flow
      Sentry.setUser({ id: user.userId, email: user.email });

      if (user.status !== "active") {
        app.log.warn({ userId: user.userId }, "Tentativa de login com usuário inativo");

        Sentry.withScope((scope) => {
          scope.setTag("auth.action", "login");
          scope.setTag("auth.status", "failure");
          scope.setTag("auth.reason", "inactive_user");
          Sentry.captureMessage("Login Failure: User inactive", "warning");
        });

        try {
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
        } catch (auditError) {
          app.log.error({ error: auditError }, "Erro ao registrar auditoria (ignorado)");
        }

        return reply.status(403).send({ message: "Usuário inativo" });
      }

      app.log.info({ userId: user.userId, passwordLength: body.password.length, hashPreview: user.passwordHash.substring(0, 20) }, "Verificando senha");
      console.log("🔵 [LOGIN] Comparando senha...");
      const validPassword = await bcrypt.compare(body.password, user.passwordHash);
      console.log("🔵 [LOGIN] Senha válida?", validPassword);
      app.log.info({ userId: user.userId, validPassword }, "Resultado da verificação de senha");

      if (!validPassword) {
        console.log("🔴 [LOGIN] Senha INVÁLIDA - retornando 401");
        app.log.warn({ userId: user.userId, email: user.email }, "Senha inválida - retornando 401");

        Sentry.withScope((scope) => {
          scope.setTag("auth.action", "login");
          scope.setTag("auth.status", "failure");
          scope.setTag("auth.reason", "invalid_password");
          Sentry.captureMessage("Login Failure: Invalid password", "warning");
        });

        try {
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
        } catch (auditError) {
          app.log.error({ error: auditError }, "Erro ao registrar auditoria (ignorado)");
        }

        return reply.status(401).send({ message: "Credenciais inválidas" });
      }

      app.log.info({ userId: user.userId }, "Senha válida, obtendo organizações");

      let organizations: Array<{ organizationId: string; name: string; slug: string; role?: string }>;
      try {
        organizations = await deps.organizationRepository.listarPorUsuario(user.userId);
        app.log.info({ userId: user.userId, orgCount: organizations.length }, "Organizações obtidas");
      } catch (orgError) {
        app.log.error({ error: orgError, userId: user.userId }, "Erro ao obter organizações, usando array vazio");
        organizations = [];
      }

      await deps.userRepository.setLastLogin(user.userId, new Date());

      const defaultOrgId = organizations[0]?.organizationId ?? null;

      // Metric: Login Success
      Sentry.withScope((scope) => {
        scope.setTag("auth.action", "login");
        scope.setTag("auth.status", "success");
        scope.setContext("login_data", {
          org_count: organizations.length,
          has_default_org: !!defaultOrgId
        });
        Sentry.captureMessage("Login Success", "info");
      });

      // Registrar login bem-sucedido
      try {
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
      } catch (auditError) {
        app.log.error({ error: auditError }, "Erro ao registrar auditoria de sucesso (ignorado)");
      }

      // Usar RS256 (com fallback HS256 se chaves não estiverem configuradas)
      const accessToken = signToken(
        {
          sub: user.userId,
          email: user.email,
          defaultOrgId,
        },
        "15m", // Access token expira em 15 minutos
      );

      // Gerar refresh token
      const refreshToken = `mrn_refresh_${randomBytes(32).toString("base64url")}`;
      const refreshTokenHash = createHash("sha256").update(refreshToken).digest("hex");

      // Calcular expiração do refresh token (30 dias)
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);

      // Salvar refresh token no banco
      await prisma.refreshToken.create({
        data: {
          userId: user.userId,
          token: refreshTokenHash,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      app.log.info({ userId: user.userId }, "Login bem-sucedido, retornando tokens");

      return reply.send({
        token: accessToken,
        refreshToken, // Retornar apenas uma vez - cliente deve armazenar
        user: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          mustChangePassword: user.mustChangePassword,
        },
        organizations,
      });
    } catch (error) {
      app.log.error({ error }, "Erro inesperado no login");
      const Sentry = await import("@sentry/node");
      Sentry.captureException(error, { tags: { "auth.action": "login", "auth.status": "error" } });
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  });
}
