import { env } from "./core/config/env";
import { createServer } from "./core/server/create-server";

import { initSentry } from "./lib/observability/sentry";

async function bootstrap() {
  initSentry();

  const server = await createServer({
    registerDocs: env.NODE_ENV !== "production", // Habilitar docs em dev/test
  });

  // Warmup blocked IP cache before starting
  const { blockedIpService } = await import("./modules/security/application/services/blocked-ip.service");
  await blockedIpService.warmupCache().catch(e => console.error("Failed to warmup blocked IP cache:", e));

  try {
    await server.listen({ port: env.API_PORT, host: env.API_HOST });
    server.log.info({ port: env.API_PORT }, "Servidor HTTP iniciado");

    if (env.NODE_ENV !== "production") {
      server.log.info(
        { url: `http://localhost:${env.API_PORT}/docs` },
        "📚 Documentação Swagger disponível em"
      );
    }

    // Start Governance Scheduler
    const { GovernanceScheduler } = await import("./modules/governance/scheduler.service");
    GovernanceScheduler.start();

  } catch (error) {
    server.log.error(error, "Falha ao iniciar servidor HTTP");
    process.exit(1);
  }
}

void bootstrap();
