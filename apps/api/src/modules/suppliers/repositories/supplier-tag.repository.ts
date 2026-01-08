import type { PrismaClient } from "@prisma/client";

export type SupplierTagRecord = {
  id: string;
  orgId: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSupplierTagInput = {
  orgId: string;
  name: string;
  color?: string | null;
};

export type UpdateSupplierTagInput = {
  name?: string;
  color?: string | null;
};

export interface SupplierTagRepository {
  create(input: CreateSupplierTagInput): Promise<SupplierTagRecord>;
  update(id: string, input: UpdateSupplierTagInput): Promise<SupplierTagRecord>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<SupplierTagRecord | null>;
  findByOrgId(orgId: string): Promise<SupplierTagRecord[]>;
  addTagToSupplier(supplierId: string, tagId: string): Promise<void>;
  removeTagFromSupplier(supplierId: string, tagId: string): Promise<void>;
  getSupplierTags(supplierId: string): Promise<SupplierTagRecord[]>;
}

export class PrismaSupplierTagRepository implements SupplierTagRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateSupplierTagInput): Promise<SupplierTagRecord> {
    const tag = await this.prisma.supplierTag.create({
      data: {
        orgId: input.orgId,
        name: input.name,
        color: input.color || null,
      },
    });
    return this.mapToRecord(tag);
  }

  async update(id: string, input: UpdateSupplierTagInput): Promise<SupplierTagRecord> {
    const tag = await this.prisma.supplierTag.update({
      where: { id },
      data: {
        name: input.name,
        color: input.color,
        updatedAt: new Date(),
      },
    });
    return this.mapToRecord(tag);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplierTag.delete({ where: { id } });
  }

  async findById(id: string): Promise<SupplierTagRecord | null> {
    const tag = await this.prisma.supplierTag.findUnique({ where: { id } });
    return tag ? this.mapToRecord(tag) : null;
  }

  async findByOrgId(orgId: string): Promise<SupplierTagRecord[]> {
    const tags = await this.prisma.supplierTag.findMany({
      where: { orgId },
      orderBy: { name: "asc" },
    });
    return tags.map(this.mapToRecord);
  }

  async addTagToSupplier(supplierId: string, tagId: string): Promise<void> {
    await this.prisma.supplierTagRelation.upsert({
      where: {
        supplierId_tagId: {
          supplierId,
          tagId,
        },
      },
      create: {
        supplierId,
        tagId,
      },
      update: {},
    });
  }

  async removeTagFromSupplier(supplierId: string, tagId: string): Promise<void> {
    await this.prisma.supplierTagRelation.deleteMany({
      where: {
        supplierId,
        tagId,
      },
    });
  }

  async getSupplierTags(supplierId: string): Promise<SupplierTagRecord[]> {
    const relations = await this.prisma.supplierTagRelation.findMany({
      where: { supplierId },
      include: {
        tag: true,
      },
    });
    return relations.map((r) => this.mapToRecord(r.tag));
  }

  private mapToRecord(tag: {
    id: string;
    orgId: string;
    name: string;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SupplierTagRecord {
    return {
      id: tag.id,
      orgId: tag.orgId,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
