import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { DeletarWorkflowPolicyUseCase } from "../application/use-cases/deletar-workflow-policy.use-case";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerDeleteWorkflowPolicyRoute(
  app: FastifyInstance,
  deps: { workflowPolicyRepository: WorkflowPolicyRepository; eventBus?: DomainEventBus },
) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/workflow-policies/:id",
    {
      schema: {
        summary: "Deletar política de workflow",
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
            description: "Política de workflow deletada com sucesso",
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const useCase = new DeletarWorkflowPolicyUseCase({
        workflowPolicyRepository: deps.workflowPolicyRepository,
        actorId: (request.headers["x-user-id"] as string) || "system",
        eventBus: deps.eventBus,
      });

      await useCase.execute({ workflowPolicyId: id });

      return reply.status(204).send();
    },
  );
}
