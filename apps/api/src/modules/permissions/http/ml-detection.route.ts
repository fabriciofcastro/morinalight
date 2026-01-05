import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getMLAnomalyDetector } from "../services/ml-anomaly-detector.service";

const detectBodySchema = z.object({
    userId: z.string().uuid().optional(),
});

export async function registerMLRoutes(app: FastifyInstance) {
    const mlDetector = getMLAnomalyDetector();

    // POST /permissions/ml/detect
    app.post("/permissions/ml/detect", async (request, reply) => {
        try {
            const { orgId } = request.user as any;
            const body = detectBodySchema.parse(request.body);

            if (body.userId) {
                // Detectar anomalia em usuário específico
                const prediction = await mlDetector.detectAnomaly(body.userId, orgId);

                return reply.send({
                    success: true,
                    data: prediction,
                });
            } else {
                // Detectar todas as anomalias
                const predictions = await mlDetector.detectAllAnomalies(orgId);

                return reply.send({
                    success: true,
                    data: {
                        total: predictions.length,
                        anomalies: predictions,
                    },
                });
            }
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "ML_DETECTION_FAILED",
            });
        }
    });

    // POST /permissions/ml/train
    app.post("/permissions/ml/train", async (request, reply) => {
        try {
            const { orgId } = request.user as any;

            const result = await mlDetector.trainModel(orgId);

            return reply.send({
                success: result.success,
                data: result.metrics,
            });
        } catch (error) {
            app.log.error(error);
            return reply.status(500).send({
                success: false,
                error: "ML_TRAINING_FAILED",
            });
        }
    });

    // GET /permissions/ml/status
    app.get("/permissions/ml/status", async (request, reply) => {
        return reply.send({
            success: true,
            data: {
                enabled: process.env.ML_ENABLED === "true",
                trainingSchedule: process.env.ML_TRAINING_SCHEDULE || "0 2 * * *",
                minSamples: parseInt(process.env.ML_MIN_TRAINING_SAMPLES || "1000"),
            },
        });
    });
}
