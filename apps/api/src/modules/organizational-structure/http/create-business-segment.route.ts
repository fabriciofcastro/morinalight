import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { businessSegmentViewSchema, criarBusinessSegmentInputSchema } from "../application/schemas/business-segment.schema";
import { CriarBusinessSegmentUseCase } from "../application/use-cases/criar-business-segment.use-case";
import type { BusinessSegmentRepository } from "../domain/repositories/business-segment-repository";

export async function registerCreateBusinessSegmentRoute(
    app: FastifyInstance,
    deps: { businessSegmentRepository: BusinessSegmentRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/business-segments",
        {
            schema: {
                summary: "Criar novo segmento de negócio",
                tags: ["Organizational Structure"],
                body: criarBusinessSegmentInputSchema.omit({ orgId: true }),
                response: {
                    201: businessSegmentViewSchema,
                },
            },
        },
        async (request, reply) => {
            const orgId = request.headers["x-org-id"] as string;
            const useCase = new CriarBusinessSegmentUseCase({
                businessSegmentRepository: deps.businessSegmentRepository,
                actorId: request.headers["x-user-id"] as string || "system",
                eventBus: app.diContainer?.resolve("domainEventBus"),
            });

            const result = await useCase.execute({
                ...request.body,
                orgId,
            });

            return reply.status(201).send(result);
        },
    );
}
