/**
 * Rota HTTP: Listar Approvals
 */

import type { FastifyInstance } from "fastify";
import {
  listarApprovalsQuerySchema,
  listarApprovalsResultadoSchema,
} from "../application/schemas/approval.schema";
import { ListarApprovalsUseCase } from "../application/use-cases/listar-approvals.use-case";
import type { ApprovalRepository } from "../domain/repositories/approval-repository";

export async function registerListApprovalsRoute(
  app: FastifyInstance,
  deps: { approvalRepository: ApprovalRepository },
) {
  app.get("/organizational-structure/approvals", async (request, reply) => {
    const orgId = (request.headers["x-org-id"] as string) || (request.query as any).orgId;

    if (!orgId) {
      return reply.code(400).send({ error: "x-org-id header é obrigatório" });
    }

    try {
      const query = listarApprovalsQuerySchema.parse(request.query);

      const useCase = new ListarApprovalsUseCase({
        approvalRepository: deps.approvalRepository,
      });

      const result = await useCase.execute({
        orgId,
        ...query,
      });

      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(400).send({ error: "Erro ao listar aprovações", details: String(error) });
    }
  });
}



