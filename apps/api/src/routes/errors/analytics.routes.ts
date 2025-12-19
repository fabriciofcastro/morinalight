/**
 * Rotas de Analytics de Erros
 * 
 * Endpoints para visualizar e analisar erros.
 */

import type { FastifyInstance } from "fastify";
import { ErrorAnalyticsManager } from "../../core/errors/error-analytics";
import { ErrorPreventionManager } from "../../core/errors/error-prevention";

export async function errorAnalyticsRoutes(app: FastifyInstance) {
  // Obter estatísticas de erros
  app.get("/analytics/stats", async (request, reply) => {
    const timeWindow = Number(request.query["timeWindow"]) || 3600000; // 1 hora padrão
    const stats = ErrorAnalyticsManager.getStats(timeWindow);
    return reply.send(stats);
  });

  // Obter top erros
  app.get("/analytics/top-errors", async (request, reply) => {
    const limit = Number(request.query["limit"]) || 10;
    const timeWindow = Number(request.query["timeWindow"]) || 3600000;
    const stats = ErrorAnalyticsManager.getStats(timeWindow);
    return reply.send(stats.topErrors.slice(0, limit));
  });

  // Obter grupo de erro específico
  app.get("/analytics/groups/:fingerprint", async (request, reply) => {
    const { fingerprint } = request.params as { fingerprint: string };
    const group = ErrorAnalyticsManager.getErrorGroup(fingerprint);
    if (!group) {
      return reply.status(404).send({ error: "Group not found" });
    }
    return reply.send(group);
  });

  // Obter grupos similares
  app.get("/analytics/similar/:fingerprint", async (request, reply) => {
    const { fingerprint } = request.params as { fingerprint: string };
    const group = ErrorAnalyticsManager.getErrorGroup(fingerprint);
    if (!group) {
      return reply.status(404).send({ error: "Group not found" });
    }

    // Criar erro de exemplo do grupo
    const sampleError = group.sampleErrors[0];
    if (!sampleError) {
      return reply.send([]);
    }

    const similar = ErrorAnalyticsManager.getSimilarGroups(sampleError);
    return reply.send(similar);
  });

  // Obter regras de prevenção
  app.get("/analytics/prevention-rules", async (request, reply) => {
    const rules = ErrorPreventionManager.getActiveRules();
    return reply.send(rules);
  });

  // Limpar analytics
  app.post("/analytics/cleanup", async (request, reply) => {
    const maxAge = Number((request.body as { maxAge?: number })?.maxAge) || 86400000;
    ErrorAnalyticsManager.cleanup(maxAge);
    ErrorPreventionManager.cleanup(maxAge);
    return reply.send({ success: true });
  });
}

