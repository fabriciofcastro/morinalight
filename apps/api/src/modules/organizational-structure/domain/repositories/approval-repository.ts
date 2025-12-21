/**
 * Approval Repository Interface
 */

import type { Approval } from "../entities/approval";

export type ApprovalFiltro = {
  orgId: string;
  workflowId?: string;
  workflowType?: string;
  policyId?: string;
  approverId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

export interface ApprovalRepository {
  save(approval: Approval): Promise<void>;
  findById(id: string): Promise<Approval | null>;
  findAll(filtro: ApprovalFiltro): Promise<Approval[]>;
  findByWorkflowId(workflowId: string, workflowType: string): Promise<Approval[]>;
  countByWorkflowId(workflowId: string, workflowType: string, status: "APPROVED"): Promise<number>;
  delete(id: string): Promise<void>;
}





