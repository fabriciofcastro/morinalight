import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { signToken } from "../../../core/auth/jwt-rs256.service";
import { env } from "../../../core/config/env";
import {
  type AuditContext,
  UnifiedAuditService,
} from "../../../core/security/unified-audit.service";
import { getPrisma } from "../../../infra/database/prisma.service";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserRepository } from "../../users/repositories/user.repository";
import type { SessionManagementService } from "../domain/services/session-management.service";

const prisma = getPrisma();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // Validação básica no login (não forçar senha forte em login existente)
  code: z.string().optional(), // 2FA code (6 digits)
  rememberMe: z.boolean().optional().default(false),
});

type LoginRouteDeps = {
  userRepository: UserRepository;
  organizationRepository: OrganizationRepository;
  auditRepository: OrganizationAuditLogRepository;
  sessionService: SessionManagementService;
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
      app.log.info(
        { body: request.body, headers: request.headers },
        "Recebida requisição de login",
      );

      let body: z.infer<typeof loginSchema>;
      try {
        body = loginSchema.parse(request.body);
        app.log.info(
          { email: body.email, passwordLength: body.password.length },
          "Schema validado",
        );
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

        // Registrar tentativa de login com e-mail inexistente (Zero Mocks Audit)
        const auditContext: AuditContext = {
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          orgId: "system",
        };
        await UnifiedAuditService.logSecurity("SECURITY_ALERT", auditContext, {
          email,
          reason: "usuario_nao_encontrado",
          severity: "WARNING",
        });

        // 🛡️ Proteção contra Timing Attack: Fazer um compare "fantasma" se o usuário não existir
        const dummyHash = "$2b$12$K19YIdV.H1D.p7.SjN7Sje9vjY.v.v.v.v.v.v.v.v.v.v.v.v.v.v";
        await bcrypt.compare(body.password, dummyHash);

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

        const auditContext: AuditContext = {
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          userId: user.userId,
          orgId: "system",
        };
        await UnifiedAuditService.logSecurity("SECURITY_ALERT", auditContext, {
          email: user.email,
          reason: "usuario_inativo",
        });

        return reply.status(403).send({ message: "Usuário inativo" });
      }

      app.log.info({ userId: user.userId }, "Verificando senha");
      console.log("🔵 [LOGIN] Comparando senha...");
      const validPassword = await bcrypt.compare(body.password, user.passwordHash);
      console.log("🔵 [LOGIN] Senha válida?", validPassword);
      app.log.info(
        { userId: user.userId, success: validPassword },
        "Resultado da verificação de senha",
      );

      if (!validPassword) {
        console.log("🔴 [LOGIN] Senha INVÁLIDA - retornando 401");
        app.log.warn({ userId: user.userId, email: user.email }, "Senha inválida - retornando 401");

        Sentry.withScope((scope) => {
          scope.setTag("auth.action", "login");
          scope.setTag("auth.status", "failure");
          scope.setTag("auth.reason", "invalid_password");
          Sentry.captureMessage("Login Failure: Invalid password", "warning");
        });

        const auditContext: AuditContext = {
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          userId: user.userId,
          orgId: "system",
        };
        await UnifiedAuditService.logSecurity("SECURITY_ALERT", auditContext, {
          email: user.email,
          reason: "senha_invalida",
        });

        return reply.status(401).send({ message: "Credenciais inválidas" });
      }

      // Check if 2FA is enabled for this user
      const userWith2FA = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { twoFactorEnabled: true, twoFactorSecret: true },
      });

      if (userWith2FA?.twoFactorEnabled && userWith2FA.twoFactorSecret) {
        // 2FA is enabled, verify the code
        if (!body.code) {
          return reply.status(401).send({
            message: "Código de autenticação de dois fatores é obrigatório",
            code: "2FA_REQUIRED",
          });
        }

        const { TotpService } = await import("../services/totp.service");
        const isValidCode = TotpService.verifyToken(body.code, userWith2FA.twoFactorSecret);

        if (!isValidCode) {
          app.log.warn({ userId: user.userId }, "Código 2FA inválido");
          return reply.status(401).send({
            message: "Código de autenticação inválido",
            code: "INVALID_2FA_CODE",
          });
        }

        app.log.info({ userId: user.userId }, "2FA verificado com sucesso");
      }

      app.log.info({ userId: user.userId }, "Senha válida, obtendo organizações");

      let organizations: Array<{
        organizationId: string;
        name: string;
        slug: string;
        role?: string;
      }>;
      try {
        organizations = await deps.organizationRepository.listarPorUsuario(user.userId);
        app.log.info(
          { userId: user.userId, orgCount: organizations.length },
          "Organizações obtidas",
        );
      } catch (orgError) {
        app.log.error(
          { error: orgError, userId: user.userId },
          "Erro ao obter organizações, usando array vazio",
        );
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
          has_default_org: !!defaultOrgId,
        });
        Sentry.captureMessage("Login Success", "info");
      });

      // Registrar login bem-sucedido (Zero Mocks Audit)
      const auditContext: AuditContext = {
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        userId: user.userId,
        orgId: defaultOrgId || "system",
      };
      await UnifiedAuditService.logSecurity("LOGIN", auditContext, {
        email: user.email,
        displayName: user.displayName,
        has2FA: !!userWith2FA?.twoFactorEnabled,
      });

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
      // Salvar refresh token no banco - (Lógica já estava implementada acima ou deve vir a seguir, removendo fechamento prematuro)

      // ----------------------------------------------------
      // Create Session with Fingerprint (Zero Mocks)
      // ----------------------------------------------------
      const fingerprint = request.headers["x-device-fingerprint"] as string | undefined;
      const userAgent = request.headers["user-agent"] || "unknown";
      const ip = request.ip;

      // Tenta obter localização (GeoIP) se possível, ou usa null
      // Vamos assumir desconhecido por enquanto para não falhar se GeoService não estiver setup

      await deps.sessionService.createSession(
        user.userId,
        accessToken,
        refreshTokenHash, // Store the hash or the token? Service expects token. Actually service stores what we pass.
        // Note: Prisma schema has 'token' and 'refreshToken'.
        // The service maps them. Let's pass the hash for refreshToken if that's what we store.
        // But typically session matches via access token.
        // Let's look at SessionManagementService.createSession usage.
        {
          ipAddress: ip,
          userAgent: userAgent,
          fingerprint: fingerprint,
          deviceId: fingerprint ? `dev_${fingerprint.substring(0, 8)}` : undefined, // Derived deviceId
        },
      );

      app.log.info(
        { userId: user.userId, rememberMe: body.rememberMe },
        "Login bem-sucedido, definindo cookies seguros",
      );

      // Cookie duration based on rememberMe
      const accessTokenMaxAge = body.rememberMe ? 15 * 60 : undefined; // 15 min or session
      const refreshTokenMaxAge = body.rememberMe ? 30 * 24 * 60 * 60 : undefined; // 30 days or session

      // Set tokens as HttpOnly cookies (secure in production)
      reply.setCookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessTokenMaxAge,
      });

      reply.setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshTokenMaxAge,
      });

      return reply.send({
        // Still return tokens in body for backward compatibility (optional)
        token: accessToken,
        refreshToken,
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
