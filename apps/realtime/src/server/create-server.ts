import websocket from "@fastify/websocket";
import fastify, { type FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { WebSocket } from "ws";
import { z } from "zod";

import { env } from "../config/env";
import { RealtimeHub } from "../hub/realtime-hub";
import { setupMetricsRoute } from "../observability/metrics";

const connectionSchema = z.object({
  token: z.string(),
});

type TokenPayload = {
  orgId: string;
  actorId: string;
  type: string;
  exp: number;
  iat: number;
};

export async function createServer() {
  const app = fastify({
    logger: true,
  });

  const hub = new RealtimeHub(env.REDIS_URL, env.REALTIME_STREAM, app.log, {
    pendingAlertThreshold: env.REALTIME_PENDING_ALERT_THRESHOLD,
    pendingAlertIntervalMs: env.REALTIME_PENDING_ALERT_INTERVAL_MS,
  });
  
  try {
    await hub.start();
    app.log.info("✅ RealtimeHub iniciado com sucesso");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("NOAUTH") || message.includes("Authentication required")) {
      app.log.warn(
        "⚠️  Redis requer autenticação. Configure REDIS_PASSWORD no .env ou use redis://:senha@localhost:6379. Realtime funcionará sem broadcast.",
      );
    } else {
      app.log.error({ err: error }, "⚠️  Falha ao iniciar RealtimeHub. Realtime funcionará sem broadcast.");
    }
  }

  await app.register(websocket, {
    options: {
      maxPayload: 1024 * 256,
    },
  });

  setupMetricsRoute(app);

  app.get("/health", async () => ({
    status: "ok",
    service: "realtime",
    timestamp: new Date().toISOString(),
  }));

  app.get("/ws", { websocket: true }, (connection: unknown, request: FastifyRequest) => {
    try {
      const query = connectionSchema.parse(request.query);
      const payload = verifyToken(query.token);

      if (payload.type !== "realtime") {
        const socket = getSocket(connection);
        if (socket) {
          socket.close(4403, "Invalid token type");
        }
        return;
      }

      const socket = getSocket(connection);
      if (!socket) {
        app.log.warn("Conexao WS sem socket disponivel");
        return;
      }
      hub.addConnection(payload.orgId, payload.actorId, socket);
      socket.send(
        JSON.stringify({
          type: "connected",
          orgId: payload.orgId,
        }),
      );
    } catch (error: unknown) {
      app.log.warn({ err: error }, "Erro na conexão WS");
      const socket = getSocket(connection);
      if (socket) {
        socket.close(4401, "Unauthorized");
      }
    }
  });

  app.addHook("onClose", async () => {
    await hub.stop();
  });

  return app;
}

function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.REALTIME_SECRET) as TokenPayload;
}

function getSocket(connection: unknown): WebSocket | null {
  if (!connection || typeof connection !== "object") {
    return null;
  }
  const socket = (connection as { socket?: WebSocket }).socket;
  return socket ?? null;
}
