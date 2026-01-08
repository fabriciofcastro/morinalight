import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AuditHistoryRepository } from "../infra/prisma/audit-history.repository";

type Dependencies = {
  historyRepository: AuditHistoryRepository;
};

export async function registerAuditHistoryRoute(app: FastifyInstance, deps: Dependencies) {
  /**
   * GET /permissions/audit/history
   * Obtém dados históricos de auditorias
   */
  app.get(
    "/audit/history",
    {
      schema: {
        tags: ["Permissions", "Audit", "History"],
        summary: "Obter histórico de auditorias",
        description: "Retorna dados históricos de auditorias para visualização de tendências",
        querystring: z.object({
          days: z.coerce.number().min(7).max(90).optional().default(30),
        }),
        response: {
          200: z.object({
            snapshots: z.array(
              z.object({
                id: z.string(),
                timestamp: z.string().datetime(),
                conformityScore: z.number(),
                totalAnomalies: z.number(),
                criticalIssues: z.number(),
                highSeverityIssues: z.number(),
                mediumSeverityIssues: z.number(),
                lowSeverityIssues: z.number(),
              }),
            ),
            trends: z.object({
              conformityScoreTrend: z.enum(["improving", "stable", "declining"]),
              anomaliesTrend: z.enum(["decreasing", "stable", "increasing"]),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { orgId } = request.user;
      const { days } = request.query;

      const data = await deps.historyRepository.getHistoricalData(orgId, days);

      return reply.status(200).send({
        snapshots: data.snapshots.map((s) => ({
          ...s,
          timestamp: s.timestamp.toISOString(),
        })),
        trends: data.trends,
      });
    },
  );

  /**
   * GET /permissions/audit/history/compare
   * Compara duas auditorias
   */
  app.get(
    "/audit/history/compare",
    {
      schema: {
        tags: ["Permissions", "Audit", "History"],
        summary: "Comparar auditorias",
        description: "Compara duas auditorias para identificar melhorias ou regressões",
        querystring: z.object({
          id1: z.string().uuid(),
          id2: z.string().uuid(),
        }),
        response: {
          200: z.object({
            audit1: z.object({
              id: z.string(),
              timestamp: z.string().datetime(),
              conformityScore: z.number(),
              totalAnomalies: z.number(),
            }),
            audit2: z.object({
              id: z.string(),
              timestamp: z.string().datetime(),
              conformityScore: z.number(),
              totalAnomalies: z.number(),
            }),
            differences: z.object({
              conformityScoreDiff: z.number(),
              totalAnomaliesDiff: z.number(),
              categoryDifferences: z.array(
                z.object({
                  category: z.string(),
                  diff: z.number(),
                  percentChange: z.number(),
                }),
              ),
            }),
            summary: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id1, id2 } = request.query;

      const comparison = await deps.historyRepository.compareAudits(id1, id2);

      return reply.status(200).send({
        audit1: {
          ...comparison.audit1,
          timestamp: comparison.audit1.timestamp.toISOString(),
        },
        audit2: {
          ...comparison.audit2,
          timestamp: comparison.audit2.timestamp.toISOString(),
        },
        differences: comparison.differences,
        summary: comparison.summary,
      });
    },
  );
}
