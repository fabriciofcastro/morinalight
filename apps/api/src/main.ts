import { env } from "./core/config/env";
import { createServer } from "./core/server/create-server";

async function bootstrap() {
  const server = await createServer();

  try {
    await server.listen({ port: env.API_PORT, host: env.API_HOST });
    server.log.info({ port: env.API_PORT }, "Servidor HTTP iniciado");
  } catch (error) {
    server.log.error(error, "Falha ao iniciar servidor HTTP");
    process.exit(1);
  }
}

void bootstrap();
