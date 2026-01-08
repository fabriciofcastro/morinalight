/**
 * Blocked IPs Route
 * API para gerenciamento de firewall/IP blocking
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { adminRouteMiddleware } from "../../../core/auth/jwt.middleware";
import { blockedIpService } from "../application/services/blocked-ip.service";

const blockIpSchema = z.object({
  ip: z.string().min(7),
  reason: z.string().min(3).max(500).optional(),
  durationMinutes: z.number().int().positive().optional(),
});

const unblockIpSchema = z.object({
  ip: z.string().min(7),
});

export async function registerBlockedIpsRoutes(app: FastifyInstance) {
  // Listar IPs bloqueados
  app.get(
    "/security/blocked-ips",
    { preHandler: [adminRouteMiddleware] },
    async (request, reply) => {
      const blocks = await blockedIpService.listBlockedIps();
      return reply.send(blocks);
    },
  );

  // Bloquear IP
  app.post(
    "/security/blocked-ips",
    { preHandler: [adminRouteMiddleware] },
    async (request, reply) => {
      const { ip, reason, durationMinutes } = blockIpSchema.parse(request.body);

      let expiresAt: Date | undefined;
      if (durationMinutes) {
        expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
      }

      await blockedIpService.blockIp(ip, reason, expiresAt, request.auth?.userId);

      return reply.send({ success: true, message: `IP ${ip} bloqueado com sucesso.` });
    },
  );

  // Desbloquear IP
  app.delete(
    "/security/blocked-ips",
    { preHandler: [adminRouteMiddleware] },
    async (request, reply) => {
      const { ip } = unblockIpSchema.parse(request.query);
      await blockedIpService.unblockIp(ip);
      return reply.send({ success: true, message: `IP ${ip} desbloqueado com sucesso.` });
    },
  );
}
