import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { criarWorkflowPolicyInputSchema, workflowPolicyBaseSchema, workflowPolicyViewSchema } from "../application/schemas/workflow-policy.schema";
import { CriarWorkflowPolicyUseCase } from "../application/use-cases/criar-workflow-policy.use-case";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerCreateWorkflowPolicyRoute(
    app: FastifyInstance,
    deps: { workflowPolicyRepository: WorkflowPolicyRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/workflow-policies",
        {
            schema: {
                summary: "Criar nova política de workflow",
                tags: ["Organizational Structure"],
                body: workflowPolicyBaseSchema,
                response: {
                    201: workflowPolicyViewSchema,
                },
            },
        },
        async (request, reply) => {
            const orgId = request.headers["x-org-id"] as string;
            const useCase = new CriarWorkflowPolicyUseCase({
                workflowPolicyRepository: deps.workflowPolicyRepository,
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
