import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify from "fastify";
import { registerHttp } from "../../app/http/routes";
import type { CatalogoModuleOptions } from "../../modules/catalogo/catalogo.module";
import { env } from "../config/env";

type CreateServerOptions = {
  registerDocs?: boolean;
  modules?: {
    catalogo?: CatalogoModuleOptions;
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
    origin: true,
    credentials: true,
  });

  await app.register(helmet);

  await registerHttp(app, modules);

  if (registerDocs) {
    app.log.warn("Documentação HTTP não implementada ainda. TODO: registrar OpenAPI");
  }

  return app;
}
