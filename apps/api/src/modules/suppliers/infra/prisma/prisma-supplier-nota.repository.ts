import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateNotaSupplierInput,
  NotaSupplierRecord,
  NotaSupplierRepository,
  UpdateNotaSupplierInput,
} from "../../repositories/supplier-nota.repository";

const prisma = getPrisma();

export class PrismaNotaSupplierRepository implements NotaSupplierRepository {
  async create(input: CreateNotaSupplierInput): Promise<NotaSupplierRecord> {
    const record = await prisma.notaSupplier.create({
      data: {
        supplierId: input.supplierId,
        orgId: input.orgId,
        titulo: input.titulo,
        conteudo: input.conteudo,
        tipo: input.tipo || "nota",
        criadoPor: input.criadoPor,
      },
    });

    return this.mapToRecord(record);
  }

  async findById(id: string): Promise<NotaSupplierRecord | null> {
    const record = await prisma.notaSupplier.findUnique({
      where: { id },
    });

    return record ? this.mapToRecord(record) : null;
  }

  async findBySupplierId(
    supplierId: string,
    filters?: { tipo?: string; criadoPor?: string; busca?: string }
  ): Promise<NotaSupplierRecord[]> {
    const where: any = { supplierId };

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.criadoPor) {
      where.criadoPor = filters.criadoPor;
    }

    // Busca por texto (título ou conteúdo)
    if (filters?.busca && filters.busca.trim().length > 0) {
      const busca = filters.busca.trim();
      where.OR = [
        { titulo: { contains: busca, mode: "insensitive" } },
        { conteudo: { contains: busca, mode: "insensitive" } },
      ];
    }

    const records = await prisma.notaSupplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return records.map(this.mapToRecord);
  }

  async update(id: string, input: UpdateNotaSupplierInput): Promise<NotaSupplierRecord> {
    const record = await prisma.notaSupplier.update({
      where: { id },
      data: {
        titulo: input.titulo,
        conteudo: input.conteudo,
        tipo: input.tipo,
      },
    });

    return this.mapToRecord(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.notaSupplier.delete({
      where: { id },
    });
  }

  private mapToRecord(record: {
    id: string;
    supplierId: string;
    orgId: string;
    titulo: string | null;
    conteudo: string;
    tipo: string;
    criadoPor: string;
    createdAt: Date;
    updatedAt: Date;
  }): NotaSupplierRecord {
    return {
      id: record.id,
      supplierId: record.supplierId,
      orgId: record.orgId,
      titulo: record.titulo,
      conteudo: record.conteudo,
      tipo: record.tipo,
      criadoPor: record.criadoPor,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

