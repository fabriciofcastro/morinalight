import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import { Branch } from "../../domain/entities/branch";
import type { BranchRepository } from "../../domain/repositories/branch-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  name: string;
  type: string;
  internalCode: string | null;
  cnpj: string | null;
  stateRegistration: string | null;
  address: unknown;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Branch.restaurar(
    {
      orgId: record.orgId,
      name: record.name,
      type: record.type,
      internalCode: record.internalCode,
      cnpj: record.cnpj,
      stateRegistration: record.stateRegistration,
      address: (record.address as Record<string, unknown>) ?? null,
      phone: record.phone,
      email: record.email,
      active: record.active,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
    record.id,
  );
}

export class PrismaBranchRepository implements BranchRepository {
  async save(branch: Branch): Promise<void> {
    const dados = branch.dados;

    await prisma.branch.upsert({
      where: { id: branch.branchId },
      create: {
        id: branch.branchId,
        orgId: dados.orgId,
        name: dados.name,
        type: dados.type,
        internalCode: dados.internalCode,
        cnpj: dados.cnpj,
        stateRegistration: dados.stateRegistration,
        address: dados.address ? (dados.address as Prisma.InputJsonValue) : Prisma.JsonNull,
        phone: dados.phone,
        email: dados.email,
        active: dados.active,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        name: dados.name,
        type: dados.type,
        internalCode: dados.internalCode,
        cnpj: dados.cnpj,
        stateRegistration: dados.stateRegistration,
        address: dados.address ? (dados.address as Prisma.InputJsonValue) : Prisma.JsonNull,
        phone: dados.phone,
        email: dados.email,
        active: dados.active,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Branch | null> {
    const record = await prisma.branch.findUnique({ where: { id } });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorId(orgId: string, id: string): Promise<Branch | null> {
    const record = await prisma.branch.findFirst({ where: { id, orgId } });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async findByOrgId(orgId: string): Promise<Branch[]> {
    const records = await prisma.branch.findMany({
      where: { orgId },
      orderBy: { createdAt: "asc" },
    });

    return records.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await prisma.branch.delete({
      where: { id },
    });
  }
}
