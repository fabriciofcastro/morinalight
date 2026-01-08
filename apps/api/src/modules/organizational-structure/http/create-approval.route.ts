/**
 * Rota HTTP: Criar Approval
 */

import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import {
  approvalViewSchema,
  criarApprovalInputSchema,
} from "../application/schemas/approval.schema";
import { CriarApprovalUseCase } from "../application/use-cases/criar-approval.use-case";
import type { ApprovalRepository } from "../domain/repositories/approval-repository";

export async function registerCreateApprovalRoute(
  app: FastifyInstance,
  deps: { approvalRepository: ApprovalRepository; eventBus?: DomainEventBus },
) {
  app.post("/organizational-structure/approvals", async (request, reply) => {
    const userId = (request as any).user?.id;
    const orgId = (request.headers["x-org-id"] as string) || (request.body as any).orgId;

    if (!orgId) {
      return reply.code(400).send({ error: "x-org-id header é obrigatório" });
    }

    if (!userId) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    try {
      const useCase = new CriarApprovalUseCase({
        approvalRepository: deps.approvalRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const result = await useCase.execute({
        ...(request.body as object),
        orgId,
      });

      return reply.code(201).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: "Erro ao criar aprovação", details: String(error) });
    }
  });
}
