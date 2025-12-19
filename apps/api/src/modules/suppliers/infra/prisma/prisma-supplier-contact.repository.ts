import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateSupplierContactInput,
  SupplierContactRecord,
  SupplierContactRepository,
  UpdateSupplierContactInput,
} from "../../repositories/supplier-contact.repository";

const prisma = getPrisma();

export class PrismaSupplierContactRepository implements SupplierContactRepository {
  async create(input: CreateSupplierContactInput): Promise<SupplierContactRecord> {
    // Se este contato for marcado como principal, desmarcar os outros
    if (input.isPrincipal) {
      await prisma.supplierContact.updateMany({
        where: { supplierId: input.supplierId, isPrincipal: true },
        data: { isPrincipal: false },
      });
    }

    const record = await prisma.supplierContact.create({
      data: {
        supplierId: input.supplierId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        cargo: input.cargo,
        isPrincipal: input.isPrincipal ?? false,
        notes: input.notes,
      },
    });

    return this.mapToRecord(record);
  }

  async findById(id: string): Promise<SupplierContactRecord | null> {
    const record = await prisma.supplierContact.findUnique({
      where: { id },
    });

    return record ? this.mapToRecord(record) : null;
  }

  async findBySupplierId(supplierId: string): Promise<SupplierContactRecord[]> {
    const records = await prisma.supplierContact.findMany({
      where: { supplierId },
      orderBy: [
        { isPrincipal: "desc" }, // Principal primeiro
        { createdAt: "asc" },
      ],
    });

    return records.map(this.mapToRecord);
  }

  async update(id: string, input: UpdateSupplierContactInput): Promise<SupplierContactRecord> {
    // Se este contato for marcado como principal, desmarcar os outros
    if (input.isPrincipal === true) {
      const contact = await prisma.supplierContact.findUnique({
        where: { id },
        select: { supplierId: true },
      });

      if (contact) {
        await prisma.supplierContact.updateMany({
          where: { supplierId: contact.supplierId, isPrincipal: true, id: { not: id } },
          data: { isPrincipal: false },
        });
      }
    }

    const record = await prisma.supplierContact.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        cargo: input.cargo,
        isPrincipal: input.isPrincipal,
        notes: input.notes,
      },
    });

    return this.mapToRecord(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.supplierContact.delete({
      where: { id },
    });
  }

  async setPrincipal(supplierId: string, contactId: string): Promise<void> {
    // Desmarcar todos os contatos principais deste fornecedor
    await prisma.supplierContact.updateMany({
      where: { supplierId, isPrincipal: true },
      data: { isPrincipal: false },
    });

    // Marcar o contato especificado como principal
    await prisma.supplierContact.update({
      where: { id: contactId },
      data: { isPrincipal: true },
    });
  }

  async getPrincipal(supplierId: string): Promise<SupplierContactRecord | null> {
    const record = await prisma.supplierContact.findFirst({
      where: {
        supplierId,
        isPrincipal: true,
      },
    });

    return record ? this.mapToRecord(record) : null;
  }

  private mapToRecord(record: {
    id: string;
    supplierId: string;
    name: string;
    email: string | null;
    phone: string | null;
    cargo: string | null;
    isPrincipal: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SupplierContactRecord {
    return {
      id: record.id,
      supplierId: record.supplierId,
      name: record.name,
      email: record.email,
      phone: record.phone,
      cargo: record.cargo,
      isPrincipal: record.isPrincipal,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

