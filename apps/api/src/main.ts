import { env } from "./core/config/env";
import { createServer } from "./core/server/create-server";

async function bootstrap() {
  const server = await createServer({
    registerDocs: env.NODE_ENV !== "production", // Habilitar docs em dev/test
  });

  try {
    await server.listen({ port: env.API_PORT, host: env.API_HOST });
    server.log.info({ port: env.API_PORT }, "Servidor HTTP iniciado");
    
    if (env.NODE_ENV !== "production") {
      server.log.info(
        { url: `http://localhost:${env.API_PORT}/docs` },
        "📚 Documentação Swagger disponível em"
      );
    }
  } catch (error) {
    server.log.error(error, "Falha ao iniciar servidor HTTP");
    process.exit(1);
  }
}

void bootstrap();
