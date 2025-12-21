/**
 * Use Case: Rejeitar Approval
 */

import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { ApprovalRepository } from "../../domain/repositories/approval-repository";
import { rejeitarApprovalInputSchema, approvalViewSchema } from "../schemas/approval.schema";

type Dependencies = {
  approvalRepository: ApprovalRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class RejeitarApprovalUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = rejeitarApprovalInputSchema.parse(rawInput);

    const approval = await this.deps.approvalRepository.findById(input.id);

    if (!approval) {
      throw new Error("Aprovação não encontrada");
    }

    approval.rejeitar(input.comments);
    await this.deps.approvalRepository.save(approval);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.ApprovalRejected",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: approval.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          approvalId: approval.approvalId,
          workflowId: approval.dados.workflowId,
          workflowType: approval.dados.workflowType,
          policyId: approval.dados.policyId,
        },
      });
    }

    return approvalViewSchema.parse({
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
    });
  }
}



