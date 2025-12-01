import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { listarWorkflowPoliciesInputSchema, listarWorkflowPoliciesResultadoSchema } from "../application/schemas/workflow-policy.schema";
import { ListarWorkflowPoliciesUseCase } from "../application/use-cases/listar-workflow-policies.use-case";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerListWorkflowPoliciesRoute(
    app: FastifyInstance,
    deps: { workflowPolicyRepository: WorkflowPolicyRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/workflow-policies",
        {
            schema: {
                summary: "Listar políticas de workflow",
                tags: ["Organizational Structure"],
                querystring: listarWorkflowPoliciesInputSchema.omit({ orgId: true }),
                response: {
                    200: listarWorkflowPoliciesResultadoSchema,
                },
            },
        },
        async (request, reply) => {
            const orgId = request.headers["x-org-id"] as string;
            const useCase = new ListarWorkflowPoliciesUseCase({
                workflowPolicyRepository: deps.workflowPolicyRepository,
            });

            const result = await useCase.execute({
                ...request.query,
                orgId,
            });

            return reply.status(200).send(result);
        },
    );
}
