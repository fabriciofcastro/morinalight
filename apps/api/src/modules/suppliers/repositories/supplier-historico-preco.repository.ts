import type { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type HistoricoPrecoSupplierRecord = {
  id: string;
  supplierId: string;
  insumoId: string | null;
  insumoNome: string;
  preco: number;
  quantidade: number | null;
  unidade: string | null;
  fichaCustoId: string | null;
  dataCompra: Date;
  createdAt: Date;
};

export type CreateHistoricoPrecoSupplierInput = {
  supplierId: string;
  insumoId?: string | null;
  insumoNome: string;
  preco: number;
  quantidade?: number | null;
  unidade?: string | null;
  fichaCustoId?: string | null;
  dataCompra: Date;
};

export interface HistoricoPrecoSupplierRepository {
  create(input: CreateHistoricoPrecoSupplierInput): Promise<HistoricoPrecoSupplierRecord>;
  findBySupplierId(
    supplierId: string,
    filters?: { insumoId?: string; dataInicio?: Date; dataFim?: Date },
  ): Promise<HistoricoPrecoSupplierRecord[]>;
  getPriceHistory(supplierId: string, insumoId?: string): Promise<HistoricoPrecoSupplierRecord[]>;
  getPriceStats(
    supplierId: string,
    insumoId?: string,
  ): Promise<{ min: number; max: number; avg: number; count: number }>;
}

export class PrismaHistoricoPrecoSupplierRepository implements HistoricoPrecoSupplierRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateHistoricoPrecoSupplierInput): Promise<HistoricoPrecoSupplierRecord> {
    const historico = await this.prisma.historicoPrecoSupplier.create({
      data: {
        supplierId: input.supplierId,
        insumoId: input.insumoId || null,
        insumoNome: input.insumoNome,
        preco: new Decimal(input.preco),
        quantidade: input.quantidade ? new Decimal(input.quantidade) : null,
        unidade: input.unidade || null,
        fichaCustoId: input.fichaCustoId || null,
        dataCompra: input.dataCompra,
      },
    });
    return this.mapToRecord(historico);
  }

  async findBySupplierId(
    supplierId: string,
    filters?: { insumoId?: string; dataInicio?: Date; dataFim?: Date },
  ): Promise<HistoricoPrecoSupplierRecord[]> {
    const where: any = { supplierId };
    if (filters?.insumoId) {
      where.insumoId = filters.insumoId;
    }
    if (filters?.dataInicio || filters?.dataFim) {
      where.dataCompra = {};
      if (filters.dataInicio) {
        where.dataCompra.gte = filters.dataInicio;
      }
      if (filters.dataFim) {
        where.dataCompra.lte = filters.dataFim;
      }
    }

    const historicos = await this.prisma.historicoPrecoSupplier.findMany({
      where,
      orderBy: { dataCompra: "desc" },
    });
    return historicos.map(this.mapToRecord);
  }

  async getPriceHistory(
    supplierId: string,
    insumoId?: string,
  ): Promise<HistoricoPrecoSupplierRecord[]> {
    const where: any = { supplierId };
    if (insumoId) {
      where.insumoId = insumoId;
    }
    const historicos = await this.prisma.historicoPrecoSupplier.findMany({
      where,
      orderBy: { dataCompra: "asc" },
    });
    return historicos.map(this.mapToRecord);
  }

  async getPriceStats(
    supplierId: string,
    insumoId?: string,
  ): Promise<{ min: number; max: number; avg: number; count: number }> {
    const where: any = { supplierId };
    if (insumoId) {
      where.insumoId = insumoId;
    }

    const stats = await this.prisma.historicoPrecoSupplier.aggregate({
      where,
      _min: { preco: true },
      _max: { preco: true },
      _avg: { preco: true },
      _count: true,
    });

    return {
      min: stats._min.preco ? Number(stats._min.preco) : 0,
      max: stats._max.preco ? Number(stats._max.preco) : 0,
      avg: stats._avg.preco ? Number(stats._avg.preco) : 0,
      count: stats._count,
    };
  }

  private mapToRecord(historico: {
    id: string;
    supplierId: string;
    insumoId: string | null;
    insumoNome: string;
    preco: Decimal;
    quantidade: Decimal | null;
    unidade: string | null;
    fichaCustoId: string | null;
    dataCompra: Date;
    createdAt: Date;
  }): HistoricoPrecoSupplierRecord {
    return {
      id: historico.id,
      supplierId: historico.supplierId,
      insumoId: historico.insumoId,
      insumoNome: historico.insumoNome,
      preco: Number(historico.preco),
      quantidade: historico.quantidade ? Number(historico.quantidade) : null,
      unidade: historico.unidade,
      fichaCustoId: historico.fichaCustoId,
      dataCompra: historico.dataCompra,
      createdAt: historico.createdAt,
    };
  }
}
