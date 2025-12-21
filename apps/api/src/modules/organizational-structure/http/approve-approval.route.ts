/**
 * Rota HTTP: Aprovar Approval
 */

import type { FastifyInstance } from "fastify";
import type { DomainEventBus } from "@morina/shared-kernel";
import { aprovarApprovalInputSchema, approvalViewSchema } from "../application/schemas/approval.schema";
import { AprovarApprovalUseCase } from "../application/use-cases/aprovar-approval.use-case";
import type { ApprovalRepository } from "../domain/repositories/approval-repository";

export async function registerApproveApprovalRoute(
  app: FastifyInstance,
  deps: { approvalRepository: ApprovalRepository; eventBus?: DomainEventBus },
) {
  app.post("/organizational-structure/approvals/:id/approve", async (request, reply) => {
    const userId = (request as any).user?.id;
    const id = (request.params as any).id;

    if (!userId) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    try {
      const body = aprovarApprovalInputSchema.parse({ id, ...(request.body as object) });

      const useCase = new AprovarApprovalUseCase({
        approvalRepository: deps.approvalRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const result = await useCase.execute(body);

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: "Erro ao aprovar aprovação", details: String(error) });
    }
  });
}





