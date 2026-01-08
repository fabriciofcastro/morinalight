/**
 * Approval Entity - Entidade de Aprovação para Workflows PBAC
 */

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApprovalProps = {
  id: string;
  orgId: string;
  workflowId: string;
  workflowType: string;
  policyId: string;
  approverId: string;
  status: ApprovalStatus;
  comments?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Approval {
  constructor(private readonly props: ApprovalProps) {
    if (!props.workflowId) {
      throw new Error("Approval requer workflowId");
    }
    if (!props.workflowType) {
      throw new Error("Approval requer workflowType");
    }
    if (!props.policyId) {
      throw new Error("Approval requer policyId");
    }
    if (!props.approverId) {
      throw new Error("Approval requer approverId");
    }
  }

  static criar(
    input: Omit<
      ApprovalProps,
      "id" | "status" | "approvedAt" | "rejectedAt" | "createdAt" | "updatedAt"
    > & {
      id?: string;
      status?: ApprovalStatus;
    },
  ) {
    const agora = new Date();
    return new Approval({
      ...input,
      id: input.id || crypto.randomUUID(),
      status: input.status || "PENDING",
      approvedAt: null,
      rejectedAt: null,
      createdAt: agora,
      updatedAt: agora,
      comments: input.comments ?? null,
    });
  }

  static restaurar(props: ApprovalProps) {
    return new Approval(props);
  }

  get approvalId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  aprovar(comments?: string) {
    if (this.props.status !== "PENDING") {
      throw new Error("Apenas aprovações pendentes podem ser aprovadas");
    }
    this.props.status = "APPROVED";
    this.props.approvedAt = new Date();
    this.props.rejectedAt = null;
    if (comments) {
      this.props.comments = comments;
    }
    this.props.updatedAt = new Date();
  }

  rejeitar(comments?: string) {
    if (this.props.status !== "PENDING") {
      throw new Error("Apenas aprovações pendentes podem ser rejeitadas");
    }
    this.props.status = "REJECTED";
    this.props.rejectedAt = new Date();
    this.props.approvedAt = null;
    if (comments) {
      this.props.comments = comments;
    }
    this.props.updatedAt = new Date();
  }

  atualizarComentarios(comments: string) {
    this.props.comments = comments;
    this.props.updatedAt = new Date();
  }
}
