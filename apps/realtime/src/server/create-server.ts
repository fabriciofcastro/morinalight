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
  await hub.start();

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
        (connection as { socket: WebSocket }).socket.close(4403, "Invalid token type");
        return;
      }

      const socket = (connection as { socket: WebSocket }).socket;
      hub.addConnection(payload.orgId, payload.actorId, socket);
      socket.send(
        JSON.stringify({
          type: "connected",
          orgId: payload.orgId,
        }),
      );
    } catch (error: unknown) {
      app.log.warn({ err: error }, "Erro na conexão WS");
      (connection as { socket: WebSocket }).socket.close(4401, "Unauthorized");
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
