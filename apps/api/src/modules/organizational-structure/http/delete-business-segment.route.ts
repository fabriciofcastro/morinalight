import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { DeletarBusinessSegmentUseCase } from "../application/use-cases/deletar-business-segment.use-case";
import type { BusinessSegmentRepository } from "../domain/repositories/business-segment-repository";

export async function registerDeleteBusinessSegmentRoute(
    app: FastifyInstance,
    deps: { businessSegmentRepository: BusinessSegmentRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        "/business-segments/:id",
        {
            schema: {
                summary: "Deletar segmento de negócio",
                tags: ["Organizational Structure"],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                    },
                    required: ["id"],
                },
                response: {
                    204: {
                        type: "null",
                        description: "Segmento de negócio deletado com sucesso",
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const useCase = new DeletarBusinessSegmentUseCase({
                businessSegmentRepository: deps.businessSegmentRepository,
                actorId: request.headers["x-user-id"] as string || "system",
                eventBus: app.diContainer?.resolve("domainEventBus"),
            });

            await useCase.execute({ businessSegmentId: id });

            return reply.status(204).send();
        },
    );
}
