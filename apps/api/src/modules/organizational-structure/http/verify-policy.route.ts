/**
 * Rota HTTP: Verificar Policy (PBAC)
 */

import type { FastifyInstance } from "fastify";
import { VerificarPolicyUseCase } from "../application/use-cases/verificar-policy.use-case";
import { PolicyService } from "../domain/services/policy-service";
import type { WorkflowPolicyRepository } from "../domain/repositories/workflow-policy-repository";

export async function registerVerifyPolicyRoute(
  app: FastifyInstance,
  deps: { workflowPolicyRepository: WorkflowPolicyRepository },
) {
  const policyService = new PolicyService(deps.workflowPolicyRepository);
  const useCase = new VerificarPolicyUseCase({ policyService });

  app.post("/organizational-structure/policies/verify", async (request, reply) => {
    const userId = (request as any).user?.id;
    const orgId = (request.headers["x-org-id"] as string) || (request.body as any).orgId;

    if (!orgId) {
      return reply.code(400).send({ error: "x-org-id header é obrigatório" });
    }

    try {
      const result = await useCase.execute({
        ...(request.body as object),
        orgId,
      });

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: "Erro ao verificar política", details: String(error) });
    }
  });
}

