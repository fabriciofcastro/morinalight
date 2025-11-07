import type { SocketStream } from "@fastify/websocket";
import websocket from "@fastify/websocket";
import fastify, { type FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { WebSocket } from "ws";
import { z } from "zod";

import { env } from "../config/env";
import { RealtimeHub } from "../hub/realtime-hub";

type SocketConnection = SocketStream & {
  socket: WebSocket;
};

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

  const hub = new RealtimeHub(env.REDIS_URL, env.REALTIME_STREAM, app.log);
  await hub.start();

  await app.register(websocket, {
    options: {
      maxPayload: 1024 * 256,
    },
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "realtime",
    timestamp: new Date().toISOString(),
  }));

  app.get("/ws", { websocket: true }, (connection: SocketConnection, request: FastifyRequest) => {
    try {
      const query = connectionSchema.parse(request.query);
      const payload = verifyToken(query.token);

      if (payload.type !== "realtime") {
        connection.socket.close(4403, "Invalid token type");
        return;
      }

      hub.addConnection(payload.orgId, payload.actorId, connection.socket);
      connection.socket.send(
        JSON.stringify({
          type: "connected",
          orgId: payload.orgId,
        }),
      );
    } catch (error: unknown) {
      app.log.warn({ err: error }, "Erro na conexão WS");
      connection.socket.close(4401, "Unauthorized");
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
