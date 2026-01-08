import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getAuditComparisonService } from "../services/audit-comparison.service";

const compareQuerySchema = z.object({
  id1: z.string().uuid(),
  id2: z.string().uuid(),
});

export async function registerAuditComparisonRoutes(app: FastifyInstance) {
  const comparisonService = getAuditComparisonService();

  // GET /permissions/audit/compare?id1=xxx&id2=yyy
  app.get("/permissions/audit/compare", async (request, reply) => {
    try {
      const query = compareQuerySchema.parse(request.query);

      const comparison = await comparisonService.compareAudits(query.id1, query.id2);

      return reply.send({
        success: true,
        data: comparison,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : "COMPARISON_FAILED",
      });
    }
  });

  // GET /permissions/audit/available
  app.get("/permissions/audit/available", async (request, reply) => {
    try {
      const { orgId } = request.user as any; // From auth middleware

      const audits = await comparisonService.getAvailableAudits(orgId);

      return reply.send({
        success: true,
        data: audits,
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        success: false,
        error: "FAILED_TO_GET_AUDITS",
      });
    }
  });
}
