import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  atualizarWorkflowPolicyBodySchema,
  workflowPolicyViewSchema,
} from "../application/schemas/workflow-policy.schema";
import { AtualizarWorkflowPolicyUseCase } from "../application/use-cases/atualizar-workflow-policy.use-case";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerUpdateWorkflowPolicyRoute(
  app: FastifyInstance,
  deps: { workflowPolicyRepository: WorkflowPolicyRepository; eventBus?: DomainEventBus },
) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/workflow-policies/:id",
    {
      schema: {
        summary: "Atualizar política de workflow",
        tags: ["Organizational Structure"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: atualizarWorkflowPolicyBodySchema,
        response: {
          200: workflowPolicyViewSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const useCase = new AtualizarWorkflowPolicyUseCase({
        workflowPolicyRepository: deps.workflowPolicyRepository,
        actorId: (request.headers["x-user-id"] as string) || "system",
        eventBus: deps.eventBus,
      });

      const body = request.body as Record<string, unknown>;
      const result = await useCase.execute({
        id,
        ...body,
      });

      return reply.status(200).send(result);
    },
  );
}
