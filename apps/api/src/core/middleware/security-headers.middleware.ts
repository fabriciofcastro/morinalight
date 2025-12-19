/**
 * Security Headers Middleware
 * Adiciona headers de segurança HTTP
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function registerSecurityHeaders(app: FastifyInstance) {
  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    // Content Security Policy
    reply.header(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    );

    // X-Content-Type-Options
    reply.header("X-Content-Type-Options", "nosniff");

    // X-Frame-Options
    reply.header("X-Frame-Options", "DENY");

    // X-XSS-Protection
    reply.header("X-XSS-Protection", "1; mode=block");

    // Referrer-Policy
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy
    reply.header(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    );

    // Strict-Transport-Security (apenas em HTTPS)
    if (request.protocol === "https") {
      reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
  });
}


