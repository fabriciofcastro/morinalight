import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  CreateDocumentoSupplierInput,
  DocumentoSupplierRecord,
  DocumentoSupplierRepository,
  UpdateDocumentoSupplierInput,
} from "../../repositories/supplier-document.repository";

const prisma = getPrisma();

export class PrismaSupplierDocumentRepository implements DocumentoSupplierRepository {
  async create(input: CreateDocumentoSupplierInput): Promise<DocumentoSupplierRecord> {
    const record = await prisma.documentoSupplier.create({
      data: {
        supplierId: input.supplierId,
        tipo: input.tipo as any,
        nomeArquivo: input.nomeArquivo,
        arquivoUrl: input.arquivoUrl,
        arquivoStorageKey: input.arquivoStorageKey,
        tamanhoBytes: input.tamanhoBytes,
        mimeType: input.mimeType,
        descricao: input.descricao,
        anexadoPor: input.anexadoPor,
      },
    });

    return this.mapToRecord(record);
  }

  async findById(id: string): Promise<DocumentoSupplierRecord | null> {
    const record = await prisma.documentoSupplier.findUnique({
      where: { id },
    });

    return record ? this.mapToRecord(record) : null;
  }

  async findBySupplierId(supplierId: string): Promise<DocumentoSupplierRecord[]> {
    const records = await prisma.documentoSupplier.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
    });

    return records.map(this.mapToRecord);
  }

  async findByType(supplierId: string, tipo: string): Promise<DocumentoSupplierRecord[]> {
    const records = await prisma.documentoSupplier.findMany({
      where: {
        supplierId,
        tipo: tipo as any,
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map(this.mapToRecord);
  }

  async update(id: string, input: UpdateDocumentoSupplierInput): Promise<DocumentoSupplierRecord> {
    const record = await prisma.documentoSupplier.update({
      where: { id },
      data: {
        nomeArquivo: input.nomeArquivo,
        descricao: input.descricao,
      },
    });

    return this.mapToRecord(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.documentoSupplier.delete({
      where: { id },
    });
  }

  private mapToRecord(record: {
    id: string;
    supplierId: string;
    tipo: string;
    nomeArquivo: string;
    arquivoUrl: string;
    arquivoStorageKey: string;
    tamanhoBytes: bigint;
    mimeType: string;
    descricao: string | null;
    anexadoPor: string;
    createdAt: Date;
  }): DocumentoSupplierRecord {
    return {
      id: record.id,
      supplierId: record.supplierId,
      tipo: record.tipo,
      nomeArquivo: record.nomeArquivo,
      arquivoUrl: record.arquivoUrl,
      arquivoStorageKey: record.arquivoStorageKey,
      tamanhoBytes: record.tamanhoBytes,
      mimeType: record.mimeType,
      descricao: record.descricao,
      anexadoPor: record.anexadoPor,
      createdAt: record.createdAt,
    };
  }
}





