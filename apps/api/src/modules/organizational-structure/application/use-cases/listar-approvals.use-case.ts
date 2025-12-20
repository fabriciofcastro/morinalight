/**
 * Use Case: Listar Approvals
 */

import type { ApprovalRepository } from "../../domain/repositories/approval-repository";
import {
  listarApprovalsInputSchema,
  listarApprovalsResultadoSchema,
} from "../schemas/approval.schema";

type Dependencies = {
  approvalRepository: ApprovalRepository;
};

export class ListarApprovalsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarApprovalsInputSchema.parse(rawInput);

    const approvals = await this.deps.approvalRepository.findAll({
      orgId: input.orgId,
      workflowId: input.workflowId,
      workflowType: input.workflowType,
      policyId: input.policyId,
      approverId: input.approverId,
      status: input.status,
    });

    return listarApprovalsResultadoSchema.parse({
      itens: approvals.map((approval) => ({
        id: approval.approvalId,
        orgId: approval.dados.orgId,
        workflowId: approval.dados.workflowId,
        workflowType: approval.dados.workflowType,
        policyId: approval.dados.policyId,
        approverId: approval.dados.approverId,
        status: approval.dados.status,
        comments: approval.dados.comments,
        approvedAt: approval.dados.approvedAt,
        rejectedAt: approval.dados.rejectedAt,
        createdAt: approval.dados.createdAt,
        updatedAt: approval.dados.updatedAt,
      })),
    });
  }
}

