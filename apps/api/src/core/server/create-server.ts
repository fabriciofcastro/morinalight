import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify, { type FastifyError, type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { type HttpModulesOptions, registerHttp } from "../../app/http/routes";
import { env } from "../config/env";
import { registerCsrfProtection } from "../middleware/csrf.middleware";
import { ipBlockMiddleware } from "../middleware/ip-block.middleware";
import { rateLimits } from "../middleware/rate-limit-redis.middleware";
import { sanitizeInputs } from "../middleware/sanitize.middleware";
import { setupHttpMetrics } from "../observability/metrics";

type CreateServerOptions = {
  registerDocs?: boolean;
  modules?: HttpModulesOptions;
};

export async function createServer({ registerDocs = false, modules }: CreateServerOptions = {}) {
  // Configuração do logger Pino com formato estruturado para Loki
  const loggerConfig = {
    level: env.LOG_LEVEL,
    serializers: {
      req: (req: FastifyRequest) => ({
        method: req.method,
        url: req.url,
        headers: {
          "user-agent": req.headers["user-agent"],
          "x-organization-id": req.headers["x-organization-id"],
        },
        remoteAddress: req.ip,
        remotePort: req.socket.remotePort,
      }),
      // biome-ignore lint/suspicious/noExplicitAny: Fastify types are complex here
      res: (res: any) => ({
        statusCode: res.statusCode,
      }),
      err: (err: FastifyError) => ({
        type: err.code || err.name,
        message: err.message,
        stack: err.stack || "",
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
    bodyLimit: 1048576, // 1MB - Proteção contra DoS via Payload enorme
  });

  // Proteção contra HTTP Parameter Pollution (HPP)
  app.addHook("onRequest", async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    if (query) {
      for (const key in query) {
        if (Array.isArray(query[key])) {
          // Se não é esperado ser array e veio array, rejeitamos (tentativa de HPP)
          // Nota: Pode ser refinado por rota se necessário
          return reply.status(400).send({
            message: "Duplicate query parameters not allowed",
            code: "HPP_PROTECTION",
          });
        }
      }
    }
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
  const fastifyCookie = await import("@fastify/cookie");
  await app.register(fastifyCookie.default || fastifyCookie, {
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
        scriptSrc:
          env.NODE_ENV === "production"
            ? ["'self'"] // Bloquear eval em produção
            : ["'self'", "'unsafe-eval'"], // Necessário para Next.js em desenvolvimento
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"], // Previne clickjacking
        formAction: ["'self'"], // Previne envio de forms para domínios externos
        upgradeInsecureRequests: [], // Força HTTPS
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  // Proteção contra IPs Bloqueados (Firewall) - Deve ser o primeiro hook
  app.addHook("onRequest", ipBlockMiddleware);

  // Sanitização automática de inputs (proteção XSS)
  app.addHook("onRequest", async (request) => {
    await sanitizeInputs(request);
  });

  // Structured Logging - Adicionar contexto estruturado aos logs
  const { structuredLoggingMiddleware, logResponse } = await import(
    "../logging/structured-logging.middleware"
  );
  app.addHook("onRequest", structuredLoggingMiddleware);
  app.addHook("onResponse", logResponse);

  // CSRF Protection (Consolidated Hardened Version)
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
  app.setErrorHandler(async (error: FastifyError, request, reply) => {
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
