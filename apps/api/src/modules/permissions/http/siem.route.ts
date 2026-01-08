import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { SIEMIntegrationService } from "../services/siem-integration.service";

const siemService = new SIEMIntegrationService();

export async function registerSIEMRoutes(app: FastifyInstance) {
  /**
   * POST /permissions/siem/configure
   * Configura integração SIEM
   */
  app.post(
    "/siem/configure",
    {
      schema: {
        tags: ["Permissions", "SIEM"],
        summary: "Configurar SIEM",
        body: z.object({
          type: z.enum(["splunk", "elk", "sentinel", "custom"]),
          host: z.string(),
          port: z.number(),
          token: z.string().optional(),
          username: z.string().optional(),
          password: z.string().optional(),
          index: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const config = request.body;

      try {
        await siemService.configure(config);
        return reply.status(200).send({ message: "SIEM configurado com sucesso" });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    },
  );

  /**
   * POST /permissions/siem/test
   * Testa conexão SIEM
   */
  app.post(
    "/siem/test",
    {
      schema: {
        tags: ["Permissions", "SIEM"],
        summary: "Testar conexão SIEM",
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await siemService.testConnection();
      return reply.status(200).send(result);
    },
  );

  /**
   * POST /permissions/siem/send-event
   * Envia evento customizado para SIEM
   */
  app.post(
    "/siem/send-event",
    {
      schema: {
        tags: ["Permissions", "SIEM"],
        summary: "Enviar evento para SIEM",
        body: z.object({
          eventType: z.string(),
          severity: z.enum(["low", "medium", "high", "critical"]),
          details: z.record(z.any()),
        }),
      },
    },
    async (request, reply) => {
      const { orgId, userId } = request.user;
      const { eventType, severity, details } = request.body;

      const event = {
        timestamp: new Date(),
        eventType,
        severity,
        source: "permission_audit_system",
        userId,
        orgId,
        details,
      };

      try {
        await siemService["sendEvent"](event);
        return reply.status(200).send({ message: "Evento enviado com sucesso" });
      } catch (error: any) {
        return reply.status(500).send({ error: error.message });
      }
    },
  );
}
