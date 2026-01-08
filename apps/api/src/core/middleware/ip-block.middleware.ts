/**
 * IP Block Middleware
 * Intercepta requisições de IPs bloqueados antes de qualquer processamento
 */

import type { FastifyReply, FastifyRequest } from "fastify";
import { blockedIpService } from "../../modules/security/application/services/blocked-ip.service";

export async function ipBlockMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const ip = request.ip;

  // Ignorar localhost/internal em desenvolvimento
  if (process.env.NODE_ENV === "development" && (ip === "127.0.0.1" || ip === "::1")) {
    return;
  }

  const isBlocked = await blockedIpService.isIpBlocked(ip);

  if (isBlocked) {
    // Registrar tentativa de acesso de IP bloqueado para SIEM/Audit se necessário
    // Aqui apenas negamos o acesso silenciosamente com status 403
    return reply.status(403).send({
      error: "Forbidden",
      message: "Seu endereço IP foi temporariamente bloqueado por motivos de segurança.",
      code: "IP_BLOCKED",
      ip,
    });
  }
}
