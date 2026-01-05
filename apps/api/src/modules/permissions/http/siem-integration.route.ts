import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSIEMForwarder } from "../services/siem-forwarder.service";

const testConnectionSchema = z.object({
    type: z.enum(["splunk", "elasticsearch", "all"]).optional().default("all"),
});

export async function registerSIEMRoutes(app: FastifyInstance) {
    const siemForwarder = getSIEMForwarder();

    // POST /permissions/integrations/siem/test
    app.post("/permissions/integrations/siem/test", async (request, reply) => {
        try {
            const body = testConnectionSchema.parse(request.body);

            const results = await siemForwarder.testConnections();

            if (body.type === "all") {
                return reply.send({
                    success: true,
                    data: results,
                });
            } else {
                return reply.send({
                    success: true,
                    data: {
                        [body.type]: results[body.type] || false,
                    },
                });
            }
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send({
                success: false,
                error: "SIEM_TEST_FAILED",
            });
        }
    });

    // POST /permissions/integrations/siem/retry-failed
    app.post("/permissions/integrations/siem/retry-failed", async (request, reply) => {
        try {
            await siemForwarder.retryFailed();

            return reply.send({
                success: true,
                message: "Retry initiated for failed events",
            });
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send({
                success: false,
                error: "RETRY_FAILED",
            });
        }
    });

    // GET /permissions/integrations/siem/status
    app.get("/permissions/integrations/siem/status", async (request, reply) => {
        const connections = await siemForwarder.testConnections();

        return reply.send({
            success: true,
            data: {
                configured: Object.keys(connections),
                status: connections,
            },
        });
    });
}
