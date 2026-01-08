import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();


export class GovernanceService {
  async getWorkflows(orgId: string) {
    return prisma.approvalWorkflow.findMany({
      where: { orgId },
    });
  }

  async createWorkflow(
    orgId: string,
    data: { module: string; fields: string[]; approverRole: string },
  ) {
    // Check if workflow exists for module, update if so, or create
    const existing = await prisma.approvalWorkflow.findUnique({
      where: {
        orgId_module: {
          orgId,
          module: data.module,
        },
      },
    });

    if (existing) {
      return prisma.approvalWorkflow.update({
        where: { id: existing.id },
        data: {
          fields: data.fields,
          approverRole: data.approverRole,
          isActive: true,
        },
      });
    }

    return prisma.approvalWorkflow.create({
      data: {
        orgId,
        module: data.module,
        fields: data.fields,
        approverRole: data.approverRole,
        minApprovals: 1,
      },
    });
  }

  async createRequest(
    orgId: string,
    requesterId: string,
    workflowId: string,
    data: any,
    status: string = "PENDING",
  ) {
    return prisma.approvalRequest.create({
      data: {
        orgId,
        requesterId,
        workflowId,
        data,
        status,
      },
    });
  }

  async updateRequest(requestId: string, data: any) {
    return prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        data,
        updatedAt: new Date(),
      },
    });
  }

  async getPendingRequests(orgId: string) {
    return prisma.approvalRequest.findMany({
      where: {
        orgId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: { displayName: true, email: true, avatarUrl: true },
        },
        workflow: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async approveRequest(requestId: string, approverId: string) {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: requestId },
      include: { workflow: true },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Request not valid for approval");
    }

    // Apply the change
    // This is the tricky part. We need to apply the change generically or based on module.
    // Ideally, we would have a handler map.
    // For now, I will assume COMPANY_SETTINGS module.

    if (request.workflow.module === "COMPANY_SETTINGS") {
      const companySettingsData = request.data as any;

      // We need to resolve the update logic.
      // Can we call existing repository? Yes.
      // Importing prisma here is fine.

      await prisma.companySettings.update({
        where: { orgId: request.orgId },
        data: companySettingsData,
      });

      // Log the audit? Ideally yes, but the original logic does it.
      // We should probably log that it was approved.
    }

    return prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        updatedAt: new Date(),
      },
    });
  }

  async rejectRequest(requestId: string, approverId: string) {
    return prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        updatedAt: new Date(),
      },
    });
  }

  // Helper to check if approval is needed
  async checkApprovalNeeded(orgId: string, module: string, newPayload: any, currentPayload: any) {
    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { orgId_module: { orgId, module } },
    });

    if (!workflow || !workflow.isActive) return null;

    const monitoredFields = workflow.fields as string[];
    let needsApproval = false;

    // Check deeply if monitored fields changed
    // Simple shallow check for now as most company settings are flat-ish at top level
    // or we just check if the key exists in the diff.

    // We assume newPayload contains the fields intended to be updated.
    // If the field is present, does it differ?

    for (const field of monitoredFields) {
      // If the field is in the new payload, check if it changed
      // Note: getting value from complex object by string path (dot notation) is harder.
      // Assuming top level fields for now as per "cnpj", "legalName".
      if (newPayload[field] !== undefined && newPayload[field] !== currentPayload[field]) {
        needsApproval = true;
        break;
      }
    }

    if (needsApproval) return workflow;
    return null;
  }
}

export const governanceService = new GovernanceService();
