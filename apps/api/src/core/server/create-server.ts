import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify, { type FastifyLoggerOptions } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { registerHttp } from "../../app/http/routes";
import type { AuthModuleOptions as CoreAuthModuleOptions } from "../../core/auth/auth.module";
import type { AuthModuleOptions } from "../../modules/auth/auth.module";
import type { CatalogoModuleOptions } from "../../modules/catalogo/catalogo.module";
import type { ClientesModuleOptions } from "../../modules/clientes/clientes.module";
import type { CompanySettingsModuleOptions } from "../../modules/company-settings/company-settings.module";
import type { NotificationsModuleOptions } from "../../modules/notifications/notifications.module";
import type { OrganizationsModuleOptions } from "../../modules/organizations/organizations.module";
import type { PrefichaModuleOptions } from "../../modules/preficha/preficha.module";
import { env } from "../config/env";
import { sanitizeInputs } from "../middleware/sanitize.middleware";
import { rateLimits } from "../middleware/rate-limit-redis.middleware";
import { setupHttpMetrics } from "../observability/metrics";

type CreateServerOptions = {
  registerDocs?: boolean;
  modules?: {
    catalogo?: CatalogoModuleOptions;
    preficha?: PrefichaModuleOptions;
    company?: CompanySettingsModuleOptions;
    notifications?: NotificationsModuleOptions;
    organizations?: OrganizationsModuleOptions;
    auth?: AuthModuleOptions;
    coreAuth?: CoreAuthModuleOptions;
    clientes?: ClientesModuleOptions;
  };
};

export async function createServer({ registerDocs = false, modules }: CreateServerOptions = {}) {
  // Configuração do logger Pino com formato estruturado para Loki
  const loggerConfig: fastify.FastifyLoggerOptions = {
    level: env.LOG_LEVEL,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          "user-agent": req.headers["user-agent"],
          "x-organization-id": req.headers["x-organization-id"],
        },
        remoteAddress: req.ip,
        remotePort: req.socket.remotePort,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: (err) => ({
        type: err.type,
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
      }),
    },
    // Em produção, usar formato JSON para Loki
    // Em desenvolvimento, usar pino-pretty para legibilidade
    transport:
      env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
        : undefined,
  };

  const app = fastify({
    logger: loggerConfig,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Sentry Middleware (Tracing e Errors)
  // Registrar cedo para capturar contexto de requests
  const { default: sentryPlugin } = await import("../../lib/observability/middleware");
  await app.register(sentryPlugin);

  // Registrar Swagger ANTES de outras configurações para capturar todas as rotas
  if (registerDocs) {
    const { registerOpenAPIDocs } = await import("../docs/openapi");
    await registerOpenAPIDocs(app, {
      enabled: true,
      routePrefix: "/docs",
      useStaticSpec: false, // Gerar dinamicamente a partir das rotas
    });
  }

  await app.register(cors, {
    origin: env.NODE_ENV === "production" ? env.FRONTEND_URL?.split(",") || true : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Organization-Id"],
  });

  // Register cookie plugin for secure token storage
  const cookie = await import("@fastify/cookie");
  await app.register(cookie.default, {
    secret: env.JWT_SECRET, // Use JWT secret for cookie signing
    parseOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });

  // Configuração avançada de segurança com Helmet
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-eval'"], // Necessário para Next.js em desenvolvimento
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Pode ser necessário para algumas integrações
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // Sanitização automática de inputs (proteção XSS)
  app.addHook("onRequest", async (request) => {
    await sanitizeInputs(request);
  });

  // Structured Logging - Adicionar contexto estruturado aos logs
  const { structuredLoggingMiddleware, logResponse } = await import("../logging/structured-logging.middleware");
  app.addHook("onRequest", structuredLoggingMiddleware);
  app.addHook("onResponse", logResponse);

  // CSRF Protection
  const { registerCsrfProtection } = await import("../middleware/csrf.middleware");
  registerCsrfProtection(app);

  // Validação de tenant obrigatória (após autenticação, antes do rate limiting)
  app.addHook("onRequest", async (request, reply) => {
    // Excluir rotas públicas
    const publicRoutes = ["/health", "/auth/login", "/auth/register"];
    const isPublic = publicRoutes.some((route) => request.url.startsWith(route));

    // Aplicar validação de tenant apenas em rotas autenticadas que não são públicas
    if (!isPublic && request.auth?.userId) {
      const { requireTenantContext } = await import("../tenant/tenant-context.middleware");
      await requireTenantContext()(request, reply);
      if (reply.sent) return;
    } else if (!isPublic && !request.auth?.userId) {
      // Limpar contexto de tenant se não houver autenticação
      const { setTenantContext } = await import("../database/tenant-filter.middleware");
      setTenantContext(null);
    }
  });

  // Rate limiting global (pode ser sobrescrito por rotas específicas)
  app.addHook("onRequest", async (request, reply) => {
    // Excluir health checks do rate limit
    if (request.url.startsWith("/health")) {
      return; // Skip rate limiting for health checks
    }

    // Aplicar rate limit geral apenas em rotas não autenticadas ou sensíveis
    const sensitiveRoutes = ["/auth/login", "/auth/register", "/users/import"];
    const isSensitive = sensitiveRoutes.some((route) => request.url.startsWith(route));

    if (isSensitive) {
      await rateLimits.auth(request, reply);
    } else {
      await rateLimits.general(request, reply);
    }
  });

  setupHttpMetrics(app);

  // Register global error handler
  app.setErrorHandler(async (error, request, reply) => {
    const { errorHandler } = await import("../errors/error-handler");
    return errorHandler(error, request, reply);
  });

  // Register 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    const { notFoundHandler } = await import("../errors/error-handler");
    return notFoundHandler(request, reply);
  });

  await registerHttp(app, modules);

  return app;
}
