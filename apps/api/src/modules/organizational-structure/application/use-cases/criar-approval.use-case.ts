/**
 * Use Case: Criar Approval
 */

import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Approval } from "../../domain/entities/approval";
import type { ApprovalRepository } from "../../domain/repositories/approval-repository";
import { criarApprovalInputSchema, approvalViewSchema } from "../schemas/approval.schema";

type Dependencies = {
  approvalRepository: ApprovalRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class CriarApprovalUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarApprovalInputSchema.parse(rawInput);

    const approval = Approval.criar({
      orgId: input.orgId,
      workflowId: input.workflowId,
      workflowType: input.workflowType,
      policyId: input.policyId,
      approverId: input.approverId,
      comments: input.comments,
    });

    await this.deps.approvalRepository.save(approval);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.ApprovalCreated",
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
          approverId: approval.dados.approverId,
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





