import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { WorkflowPolicy } from "../../domain/entities/workflow-policy";
import type {
  WorkflowPolicyFiltro,
  WorkflowPolicyRepository,
} from "../../domain/repositories/workflow-policy-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  module: string;
  flowType: string;
  config: unknown;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return WorkflowPolicy.restaurar({
    id: record.id,
    orgId: record.orgId,
    module: record.module,
    flowType: record.flowType,
    config: record.config,
    active: record.active,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaWorkflowPolicyRepository implements WorkflowPolicyRepository {
  async save(workflowPolicy: WorkflowPolicy): Promise<void> {
    const dados = workflowPolicy.dados;
    await prisma.workflowPolicy.upsert({
      where: { id: dados.id },
      create: {
        id: dados.id,
        orgId: dados.orgId,
        module: dados.module,
        flowType: dados.flowType,
        config: dados.config as Prisma.InputJsonValue,
        active: dados.active,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        module: dados.module,
        flowType: dados.flowType,
        config: dados.config as Prisma.InputJsonValue,
        active: dados.active,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<WorkflowPolicy | null> {
    const record = await prisma.workflowPolicy.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async findAll(filtro: WorkflowPolicyFiltro): Promise<WorkflowPolicy[]> {
    const where: Prisma.WorkflowPolicyWhereInput = {
      orgId: filtro.orgId,
    };

    if (filtro.active !== undefined) {
      where.active = filtro.active;
    }

    if (filtro.busca) {
      where.OR = [
        { module: { contains: filtro.busca, mode: "insensitive" } },
        { flowType: { contains: filtro.busca, mode: "insensitive" } },
      ];
    }

    const records = await prisma.workflowPolicy.findMany({
      where,
      orderBy: { module: "asc" },
    });

    return records.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await prisma.workflowPolicy.delete({
      where: { id },
    });
  }
}
