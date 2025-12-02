import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { listarBusinessSegmentsQuerySchema, listarBusinessSegmentsResultadoSchema } from "../application/schemas/business-segment.schema";
import { ListarBusinessSegmentsUseCase } from "../application/use-cases/listar-business-segments.use-case";
import type { BusinessSegmentRepository } from "../domain/repositories/business-segment-repository";

export async function registerListBusinessSegmentsRoute(
    app: FastifyInstance,
    deps: { businessSegmentRepository: BusinessSegmentRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/business-segments",
        {
            schema: {
                summary: "Listar segmentos de negócio",
                tags: ["Organizational Structure"],
                querystring: listarBusinessSegmentsQuerySchema,
                response: {
                    200: listarBusinessSegmentsResultadoSchema,
                },
            },
        },
        async (request, reply) => {
            const orgId = request.headers["x-org-id"] as string;
            const useCase = new ListarBusinessSegmentsUseCase({
                businessSegmentRepository: deps.businessSegmentRepository,
            });

            const result = await useCase.execute({
                ...request.query,
                orgId,
            });

            return reply.status(200).send(result);
        },
    );
}
