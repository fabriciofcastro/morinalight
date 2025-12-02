import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { atualizarBusinessSegmentBodySchema, atualizarBusinessSegmentInputSchema, businessSegmentViewSchema } from "../application/schemas/business-segment.schema";
// ...
import { AtualizarBusinessSegmentUseCase } from "../application/use-cases/atualizar-business-segment.use-case";
import type { BusinessSegmentRepository } from "../domain/repositories/business-segment-repository";

export async function registerUpdateBusinessSegmentRoute(
    app: FastifyInstance,
    deps: { businessSegmentRepository: BusinessSegmentRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().put(
        "/business-segments/:id",
        {
            schema: {
                summary: "Atualizar segmento de negócio",
                tags: ["Organizational Structure"],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                    },
                    required: ["id"],
                },
                body: atualizarBusinessSegmentBodySchema,
                response: {
                    200: businessSegmentViewSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const useCase = new AtualizarBusinessSegmentUseCase({
                businessSegmentRepository: deps.businessSegmentRepository,
                actorId: request.headers["x-user-id"] as string || "system",
                eventBus: app.diContainer?.resolve("domainEventBus"),
            });

            const result = await useCase.execute({
                id,
                ...request.body,
            });

            return reply.status(200).send(result);
        },
    );
}
