import type { FastifyInstance } from "fastify";
import type { CatalogoModuleOptions } from "../../modules/catalogo/catalogo.module";
import { registerCatalogoModule } from "../../modules/catalogo/catalogo.module";
import { registerRealtimeRoutes } from "../../modules/realtime/realtime.routes";

type HttpModulesOptions = {
  catalogo?: CatalogoModuleOptions;
  realtime?: { enabled?: boolean };
};

export async function registerHttp(app: FastifyInstance, options: HttpModulesOptions = {}) {
  app.get("/health", async () => ({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  }));

  await registerCatalogoModule(app, options.catalogo);

  if (options.realtime?.enabled ?? true) {
    await registerRealtimeRoutes(app);
  }
}
