import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { MLAnomalyDetectionService } from "../services/ml-anomaly-detection.service";

export async function registerMLAnomalyRoutes(app: FastifyInstance) {
    const mlService = new MLAnomalyDetectionService(app.prisma);

    /**
     * POST /permissions/ml/train
     * Treina o modelo de ML
     */
    app.post(
        "/ml/train",
        {
            schema: {
                tags: ["Permissions", "ML"],
                summary: "Treinar modelo ML",
                response: {
                    200: z.object({
                        success: z.boolean(),
                        accuracy: z.number(),
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;

            const result = await mlService.trainModel(orgId);

            return reply.status(200).send({
                ...result,
                message: result.success
                    ? `Modelo treinado com ${(result.accuracy * 100).toFixed(2)}% de acurácia`
                    : "Erro ao treinar modelo",
            });
        },
    );

    /**
     * POST /permissions/ml/detect
     * Detecta anomalias usando ML
     */
    app.post(
        "/ml/detect",
        {
            schema: {
                tags: ["Permissions", "ML"],
                summary: "Detectar anomalias com ML",
                response: {
                    200: z.object({
                        predictions: z.array(
                            z.object({
                                userId: z.string(),
                                userEmail: z.string(),
                                anomalyType: z.string(),
                                probability: z.number(),
                                confidence: z.enum(["low", "medium", "high"]),
                                predictedAt: z.string().datetime(),
                                features: z.record(z.number()),
                            }),
                        ),
                        summary: z.object({
                            totalPredictions: z.number(),
                            highConfidence: z.number(),
                            mediumConfidence: z.number(),
                            lowConfidence: z.number(),
                        }),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { orgId } = request.user;

            const predictions = await mlService.detectAnomalies(orgId);

            const summary = {
                totalPredictions: predictions.length,
                highConfidence: predictions.filter((p) => p.confidence === "high").length,
                mediumConfidence: predictions.filter((p) => p.confidence === "medium").length,
                lowConfidence: predictions.filter((p) => p.confidence === "low").length,
            };

            return reply.status(200).send({
                predictions: predictions.map((p) => ({
                    ...p,
                    predictedAt: p.predictedAt.toISOString(),
                })),
                summary,
            });
        },
    );

    /**
     * POST /permissions/ml/save
     * Salva modelo treinado
     */
    app.post(
        "/ml/save",
        {
            schema: {
                tags: ["Permissions", "ML"],
                summary: "Salvar modelo ML",
                body: z.object({
                    path: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { path } = request.body;

            try {
                await mlService.saveModel(path);
                return reply.status(200).send({ message: "Modelo salvo com sucesso" });
            } catch (error: any) {
                return reply.status(500).send({ error: error.message });
            }
        },
    );

    /**
     * POST /permissions/ml/load
     * Carrega modelo treinado
     */
    app.post(
        "/ml/load",
        {
            schema: {
                tags: ["Permissions", "ML"],
                summary: "Carregar modelo ML",
                body: z.object({
                    path: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { path } = request.body;

            try {
                await mlService.loadModel(path);
                return reply.status(200).send({ message: "Modelo carregado com sucesso" });
            } catch (error: any) {
                return reply.status(500).send({ error: error.message });
            }
        },
    );
}
