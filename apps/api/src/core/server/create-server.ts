import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify from "fastify";
import { registerHttp } from "../../app/http/routes";
import type { AuthModuleOptions as CoreAuthModuleOptions } from "../../core/auth/auth.module";
import type { AuthModuleOptions } from "../../modules/auth/auth.module";
import type { CatalogoModuleOptions } from "../../modules/catalogo/catalogo.module";
import type { CompanySettingsModuleOptions } from "../../modules/company-settings/company-settings.module";
import type { NotificationsModuleOptions } from "../../modules/notifications/notifications.module";
import type { OrganizationsModuleOptions } from "../../modules/organizations/organizations.module";
import type { PrefichaModuleOptions } from "../../modules/preficha/preficha.module";
import type { ClientesModuleOptions } from "../../modules/clientes/clientes.module";
import { env } from "../config/env";
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
  const app = fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
    },
  });

  await app.register(cors, {
    origin: env.NODE_ENV === "production" 
      ? env.FRONTEND_URL?.split(",") || true
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Organization-Id"],
  });

  // Configuração avançada de segurança com Helmet
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
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
  setupHttpMetrics(app);

  await registerHttp(app, modules);

  if (registerDocs) {
    app.log.warn("Documentação HTTP não implementada ainda. TODO: registrar OpenAPI");
  }

  return app;
}
