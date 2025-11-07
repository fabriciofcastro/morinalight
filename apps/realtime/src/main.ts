import { env } from "./config/env";
import { createServer } from "./server/create-server";

async function bootstrap() {
  const server = await createServer();

  try {
    await server.listen({ port: env.REALTIME_PORT, host: env.REALTIME_HOST });
    server.log.info(
      { port: env.REALTIME_PORT, host: env.REALTIME_HOST },
      "Realtime server is running",
    );
  } catch (error) {
    server.log.error(error, "Failed to start realtime server");
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
