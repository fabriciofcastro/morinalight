import type { Prisma, PrismaClient, Supplier } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateSupplierInput,
  SupplierRecord,
  SupplierRepository,
  UpdateSupplierInput,
} from "../../repositories/supplier.repository";

export class PrismaSupplierRepository implements SupplierRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? getPrisma();
  }

  async findById(id: string): Promise<SupplierRecord | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return null;
    }

    return this.mapToRecord(supplier);
  }

  async findByOrgId(
    orgId: string,
    filters?: { status?: string; busca?: string },
  ): Promise<SupplierRecord[]> {
    const where: Prisma.SupplierWhereInput = { orgId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.busca) {
      where.OR = [
        { name: { contains: filters.busca, mode: "insensitive" } },
        { email: { contains: filters.busca, mode: "insensitive" } },
        { document: { contains: filters.busca, mode: "insensitive" } },
      ];
    }

    const suppliers = await this.prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return suppliers.map(this.mapToRecord);
  }

  async create(input: CreateSupplierInput): Promise<SupplierRecord> {
    const supplier = await this.prisma.supplier.create({
      data: {
        orgId: input.orgId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        document: input.document,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        status: input.status || "ativo",
        notes: input.notes,
        createdBy: input.createdBy,
        updatedBy: input.updatedBy,
      },
    });

    return this.mapToRecord(supplier);
  }

  async update(id: string, input: UpdateSupplierInput): Promise<SupplierRecord> {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        document: input.document,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        status: input.status,
        notes: input.notes,
        updatedBy: input.updatedBy,
        updatedAt: new Date(),
      },
    });

    return this.mapToRecord(supplier);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id },
    });
  }

  private mapToRecord(supplier: Supplier): SupplierRecord {
    return {
      id: supplier.id,
      orgId: supplier.orgId,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      document: supplier.document,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zipCode: supplier.zipCode,
      status: supplier.status,
      notes: supplier.notes,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}
