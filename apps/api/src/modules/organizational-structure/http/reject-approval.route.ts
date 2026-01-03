/**
 * Rota HTTP: Rejeitar Approval
 */

import type { FastifyInstance } from "fastify";
import type { DomainEventBus } from "@morina/shared-kernel";
import { rejeitarApprovalInputSchema, approvalViewSchema } from "../application/schemas/approval.schema";
import { RejeitarApprovalUseCase } from "../application/use-cases/rejeitar-approval.use-case";
import type { ApprovalRepository } from "../domain/repositories/approval-repository";

export async function registerRejectApprovalRoute(
  app: FastifyInstance,
  deps: { approvalRepository: ApprovalRepository; eventBus?: DomainEventBus },
) {
  app.post("/organizational-structure/approvals/:id/reject", async (request, reply) => {
    const userId = (request as any).user?.id;
    const id = (request.params as any).id;

    if (!userId) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    try {
      const body = rejeitarApprovalInputSchema.parse({ id, ...(request.body as object) });

      const useCase = new RejeitarApprovalUseCase({
        approvalRepository: deps.approvalRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const result = await useCase.execute(body);

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: "Erro ao rejeitar aprovação", details: String(error) });
    }
  });
}









