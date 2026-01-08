import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateVersaoSupplierInput,
  VersaoSupplierRecord,
  VersaoSupplierRepository,
} from "../../repositories/supplier-version.repository";

const prisma = getPrisma();

export class PrismaSupplierVersionRepository implements VersaoSupplierRepository {
  async create(input: CreateVersaoSupplierInput): Promise<VersaoSupplierRecord> {
    const record = await prisma.versaoSupplier.create({
      data: {
        supplierId: input.supplierId,
        versao: input.versao,
        dadosSnapshot: input.dadosSnapshot as any,
        criadoPor: input.criadoPor,
        motivoAlteracao: input.motivoAlteracao,
      },
    });

    return this.mapToRecord(record);
  }

  async findBySupplierId(supplierId: string): Promise<VersaoSupplierRecord[]> {
    const records = await prisma.versaoSupplier.findMany({
      where: { supplierId },
      orderBy: [{ versao: "desc" }, { createdAt: "desc" }],
    });

    return records.map(this.mapToRecord);
  }

  async findByVersion(supplierId: string, versao: number): Promise<VersaoSupplierRecord | null> {
    const record = await prisma.versaoSupplier.findUnique({
      where: {
        supplierId_versao: {
          supplierId,
          versao,
        },
      },
    });

    return record ? this.mapToRecord(record) : null;
  }

  async getLatestVersion(supplierId: string): Promise<VersaoSupplierRecord | null> {
    const record = await prisma.versaoSupplier.findFirst({
      where: { supplierId },
      orderBy: [{ versao: "desc" }, { createdAt: "desc" }],
    });

    return record ? this.mapToRecord(record) : null;
  }

  async getNextVersionNumber(supplierId: string): Promise<number> {
    const latest = await this.getLatestVersion(supplierId);
    return latest ? latest.versao + 1 : 1;
  }

  private mapToRecord(record: {
    id: string;
    supplierId: string;
    versao: number;
    dadosSnapshot: unknown;
    criadoPor: string;
    motivoAlteracao: string | null;
    createdAt: Date;
  }): VersaoSupplierRecord {
    return {
      id: record.id,
      supplierId: record.supplierId,
      versao: record.versao,
      dadosSnapshot: record.dadosSnapshot,
      criadoPor: record.criadoPor,
      motivoAlteracao: record.motivoAlteracao,
      createdAt: record.createdAt,
    };
  }
}
