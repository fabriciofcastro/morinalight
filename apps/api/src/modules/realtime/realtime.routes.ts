import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../../core/config/env";

const headersSchema = z.object({
  "x-org-id": z.string().min(1),
  "x-actor-id": z.string().min(1),
});

const bodySchema = z.object({
  expSeconds: z.coerce.number().positive().max(600).default(300),
});

export async function registerRealtimeRoutes(app: FastifyInstance) {
  const secret = env.REALTIME_SECRET ?? process.env.REALTIME_SECRET;

  if (!secret) {
    app.log.warn("REALTIME_SECRET não configurado. /realtime/token indisponível.");
    return;
  }

  app.post("/realtime/token", async (request, reply) => {
    const headers = headersSchema.parse(request.headers);
    const body = bodySchema.parse(request.body ?? {});

    const payload = {
      orgId: headers["x-org-id"],
      actorId: headers["x-actor-id"],
      type: "realtime",
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: body.expSeconds,
      jwtid: randomUUID(),
    });

    return reply.status(201).send({ token, expiresIn: body.expSeconds });
  });
}
