import type { PrismaClient } from "@prisma/client";

export type AvaliacaoSupplierRecord = {
  id: string;
  supplierId: string;
  userId: string;
  nota: number;
  comentario: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAvaliacaoSupplierInput = {
  supplierId: string;
  userId: string;
  nota: number; // 1 a 5
  comentario?: string | null;
};

export type UpdateAvaliacaoSupplierInput = {
  nota?: number;
  comentario?: string | null;
};

export interface AvaliacaoSupplierRepository {
  create(input: CreateAvaliacaoSupplierInput): Promise<AvaliacaoSupplierRecord>;
  update(id: string, input: UpdateAvaliacaoSupplierInput): Promise<AvaliacaoSupplierRecord>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AvaliacaoSupplierRecord | null>;
  findBySupplierId(supplierId: string): Promise<AvaliacaoSupplierRecord[]>;
  findByUserId(supplierId: string, userId: string): Promise<AvaliacaoSupplierRecord | null>;
  getAverageRating(supplierId: string): Promise<{ average: number; count: number }>;
}

export class PrismaAvaliacaoSupplierRepository implements AvaliacaoSupplierRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateAvaliacaoSupplierInput): Promise<AvaliacaoSupplierRecord> {
    // Validar nota
    if (input.nota < 1 || input.nota > 5) {
      throw new Error("Nota deve estar entre 1 e 5");
    }

    const avaliacao = await this.prisma.avaliacaoSupplier.upsert({
      where: {
        supplierId_userId: {
          supplierId: input.supplierId,
          userId: input.userId,
        },
      },
      create: {
        supplierId: input.supplierId,
        userId: input.userId,
        nota: input.nota,
        comentario: input.comentario || null,
      },
      update: {
        nota: input.nota,
        comentario: input.comentario || null,
        updatedAt: new Date(),
      },
    });
    return this.mapToRecord(avaliacao);
  }

  async update(id: string, input: UpdateAvaliacaoSupplierInput): Promise<AvaliacaoSupplierRecord> {
    if (input.nota !== undefined && (input.nota < 1 || input.nota > 5)) {
      throw new Error("Nota deve estar entre 1 e 5");
    }

    const avaliacao = await this.prisma.avaliacaoSupplier.update({
      where: { id },
      data: {
        nota: input.nota,
        comentario: input.comentario,
        updatedAt: new Date(),
      },
    });
    return this.mapToRecord(avaliacao);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.avaliacaoSupplier.delete({ where: { id } });
  }

  async findById(id: string): Promise<AvaliacaoSupplierRecord | null> {
    const avaliacao = await this.prisma.avaliacaoSupplier.findUnique({ where: { id } });
    return avaliacao ? this.mapToRecord(avaliacao) : null;
  }

  async findBySupplierId(supplierId: string): Promise<AvaliacaoSupplierRecord[]> {
    const avaliacoes = await this.prisma.avaliacaoSupplier.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
    });
    return avaliacoes.map(this.mapToRecord);
  }

  async findByUserId(supplierId: string, userId: string): Promise<AvaliacaoSupplierRecord | null> {
    const avaliacao = await this.prisma.avaliacaoSupplier.findUnique({
      where: {
        supplierId_userId: {
          supplierId,
          userId,
        },
      },
    });
    return avaliacao ? this.mapToRecord(avaliacao) : null;
  }

  async getAverageRating(supplierId: string): Promise<{ average: number; count: number }> {
    const result = await this.prisma.avaliacaoSupplier.aggregate({
      where: { supplierId },
      _avg: { nota: true },
      _count: true,
    });
    return {
      average: result._avg.nota || 0,
      count: result._count,
    };
  }

  private mapToRecord(avaliacao: {
    id: string;
    supplierId: string;
    userId: string;
    nota: number;
    comentario: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AvaliacaoSupplierRecord {
    return {
      id: avaliacao.id,
      supplierId: avaliacao.supplierId,
      userId: avaliacao.userId,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario,
      createdAt: avaliacao.createdAt,
      updatedAt: avaliacao.updatedAt,
    };
  }
}
