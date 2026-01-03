/**
 * Prisma Approval Repository Implementation
 */

import { Prisma } from "@prisma/client";
import { prisma } from "../../../../infra/prisma/client";
import { Approval } from "../../domain/entities/approval";
import type { ApprovalFiltro, ApprovalRepository } from "../../domain/repositories/approval-repository";

function toDomain(record: {
  id: string;
  orgId: string;
  workflowId: string;
  workflowType: string;
  policyId: string;
  approverId: string;
  status: string;
  comments: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Approval.restaurar({
    id: record.id,
    orgId: record.orgId,
    workflowId: record.workflowId,
    workflowType: record.workflowType,
    policyId: record.policyId,
    approverId: record.approverId,
    status: record.status as "PENDING" | "APPROVED" | "REJECTED",
    comments: record.comments,
    approvedAt: record.approvedAt,
    rejectedAt: record.rejectedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaApprovalRepository implements ApprovalRepository {
  async save(approval: Approval): Promise<void> {
    const dados = approval.dados;
    await prisma.approval.upsert({
      where: { id: dados.id },
      create: {
        id: dados.id,
        orgId: dados.orgId,
        workflowId: dados.workflowId,
        workflowType: dados.workflowType,
        policyId: dados.policyId,
        approverId: dados.approverId,
        status: dados.status,
        comments: dados.comments,
        approvedAt: dados.approvedAt,
        rejectedAt: dados.rejectedAt,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        status: dados.status,
        comments: dados.comments,
        approvedAt: dados.approvedAt,
        rejectedAt: dados.rejectedAt,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Approval | null> {
    const record = await prisma.approval.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async findAll(filtro: ApprovalFiltro): Promise<Approval[]> {
    const where: Prisma.ApprovalWhereInput = {
      orgId: filtro.orgId,
    };

    if (filtro.workflowId) {
      where.workflowId = filtro.workflowId;
    }

    if (filtro.workflowType) {
      where.workflowType = filtro.workflowType;
    }

    if (filtro.policyId) {
      where.policyId = filtro.policyId;
    }

    if (filtro.approverId) {
      where.approverId = filtro.approverId;
    }

    if (filtro.status) {
      where.status = filtro.status;
    }

    const records = await prisma.approval.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return records.map(toDomain);
  }

  async findByWorkflowId(workflowId: string, workflowType: string): Promise<Approval[]> {
    const records = await prisma.approval.findMany({
      where: {
        workflowId,
        workflowType,
      },
      orderBy: { createdAt: "asc" },
    });

    return records.map(toDomain);
  }

  async countByWorkflowId(
    workflowId: string,
    workflowType: string,
    status: "APPROVED",
  ): Promise<number> {
    return prisma.approval.count({
      where: {
        workflowId,
        workflowType,
        status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.approval.delete({
      where: { id },
    });
  }
}









