import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  workflowPolicyBaseSchema,
  workflowPolicyViewSchema,
} from "../application/schemas/workflow-policy.schema";
import { CriarWorkflowPolicyUseCase } from "../application/use-cases/criar-workflow-policy.use-case";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerCreateWorkflowPolicyRoute(
  app: FastifyInstance,
  deps: { workflowPolicyRepository: WorkflowPolicyRepository; eventBus?: DomainEventBus },
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
        actorId: (request.headers["x-user-id"] as string) || "system",
        eventBus: deps.eventBus,
      });

      const body = request.body as Record<string, unknown>;
      const result = await useCase.execute({
        ...body,
        orgId,
      });

      return reply.status(201).send(result);
    },
  );
}
