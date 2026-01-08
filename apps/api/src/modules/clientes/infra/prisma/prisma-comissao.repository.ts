import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type { ComissaoProps, ComissaoStatus } from "../../domain/entities/comissao";
import { Comissao } from "../../domain/entities/comissao";
import type {
  ComissaoFiltro,
  ComissaoRepository,
} from "../../domain/repositories/comissao-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  representanteId: string;
  clienteId: string;
  vendaId: string;
  valorComissao: Prisma.Decimal | number;
  percentualAplicado: Prisma.Decimal | number;
  dataVenda: Date;
  dataCalculo: Date;
  dataPagamento: Date | null;
  status: string;
  observacoes: string | null;
  assinadoEm: Date | null;
  assinadoPor: string | null;
  numeroPagamento: string | null;
  comprovantePagamento: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: ComissaoProps = {
    id: record.id,
    orgId: record.orgId,
    representanteId: record.representanteId,
    clienteId: record.clienteId,
    vendaId: record.vendaId,
    valorComissao: Number(record.valorComissao),
    percentualAplicado: Number(record.percentualAplicado),
    dataVenda: record.dataVenda,
    dataCalculo: record.dataCalculo,
    dataPagamento: record.dataPagamento,
    status: record.status as ComissaoStatus,
    observacoes: record.observacoes,
    assinadoEm: record.assinadoEm,
    assinadoPor: record.assinadoPor,
    numeroPagamento: record.numeroPagamento,
    comprovantePagamento: record.comprovantePagamento,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Comissao.restaurar(props);
}

export class PrismaComissaoRepository implements ComissaoRepository {
  async salvar(comissao: Comissao) {
    const dados = comissao.dados;

    await prisma.comissao.upsert({
      where: { id: comissao.comissaoId },
      create: {
        id: comissao.comissaoId,
        orgId: dados.orgId,
        representanteId: dados.representanteId,
        clienteId: dados.clienteId,
        vendaId: dados.vendaId,
        valorComissao: dados.valorComissao,
        percentualAplicado: dados.percentualAplicado,
        dataVenda: dados.dataVenda,
        dataCalculo: dados.dataCalculo,
        dataPagamento: dados.dataPagamento,
        status: dados.status,
        observacoes: dados.observacoes,
        assinadoEm: dados.assinadoEm,
        assinadoPor: dados.assinadoPor,
        numeroPagamento: dados.numeroPagamento,
        comprovantePagamento: dados.comprovantePagamento,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        valorComissao: dados.valorComissao,
        percentualAplicado: dados.percentualAplicado,
        dataPagamento: dados.dataPagamento,
        status: dados.status,
        observacoes: dados.observacoes,
        assinadoEm: dados.assinadoEm,
        assinadoPor: dados.assinadoPor,
        numeroPagamento: dados.numeroPagamento,
        comprovantePagamento: dados.comprovantePagamento,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, comissaoId: string) {
    const record = await prisma.comissao.findUnique({
      where: { id: comissaoId },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorVendaId(orgId: string, vendaId: string) {
    const record = await prisma.comissao.findFirst({
      where: { orgId, vendaId },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro?: ComissaoFiltro) {
    const limit = Math.min(Math.max(filtro?.limite ?? 20, 1), 50);

    const andFilters: Prisma.ComissaoWhereInput[] = [];
    if (filtro?.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro?.representanteId) {
      andFilters.push({ representanteId: filtro.representanteId });
    }
    if (filtro?.clienteId) {
      andFilters.push({ clienteId: filtro.clienteId });
    }
    if (filtro?.dataInicio || filtro?.dataFim) {
      andFilters.push({
        dataVenda: {
          ...(filtro.dataInicio && { gte: filtro.dataInicio }),
          ...(filtro.dataFim && { lte: filtro.dataFim }),
        },
      });
    }
    if (filtro?.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { dataVenda: { lt: cursor.dataVenda } },
          {
            AND: [{ dataVenda: cursor.dataVenda }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where: Prisma.ComissaoWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.comissao.findMany({
      where,
      take: limit,
      orderBy: [{ dataVenda: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  async listarPendentes(orgId: string, representanteId?: string) {
    const where = {
      orgId,
      status: "pendente" as const,
      ...(representanteId && { representanteId }),
    };

    const records = await prisma.comissao.findMany({
      where,
      orderBy: [{ dataVenda: "asc" }],
    });

    return records.map(toDomain);
  }

  async listarPagas(orgId: string, representanteId?: string, dataInicio?: Date, dataFim?: Date) {
    const where = {
      orgId,
      status: "paga" as const,
      ...(representanteId && { representanteId }),
      ...((dataInicio || dataFim) && {
        dataPagamento: {
          ...(dataInicio && { gte: dataInicio }),
          ...(dataFim && { lte: dataFim }),
        },
      }),
    };

    const records = await prisma.comissao.findMany({
      where,
      orderBy: [{ dataPagamento: "desc" }],
    });

    return records.map(toDomain);
  }

  async contarPorStatus(orgId: string, status: ComissaoStatus): Promise<number> {
    return prisma.comissao.count({
      where: { orgId, status },
    });
  }

  async somarValorPorStatus(orgId: string, status: ComissaoStatus): Promise<number> {
    const result = await prisma.comissao.aggregate({
      where: { orgId, status },
      _sum: { valorComissao: true },
    });

    return Number(result._sum?.valorComissao ?? 0);
  }
}

function encodeCursor(comissao: { id: string; dataVenda: Date }) {
  const data = JSON.stringify({
    id: comissao.id,
    dataVenda: comissao.dataVenda.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      dataVenda: string;
    };
    return {
      id: parsed.id,
      dataVenda: new Date(parsed.dataVenda),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
