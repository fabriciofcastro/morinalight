import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type { ContratoProps, ContratoStatus } from "../../domain/entities/contrato";
import { Contrato } from "../../domain/entities/contrato";
import type { ContratoRepository } from "../../domain/repositories/contrato-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  representanteId: string;
  numero: string;
  dataInicio: Date;
  dataFim: Date | null;
  percentualComissao: Prisma.Decimal | number;
  valorMinimo: Prisma.Decimal | number | null;
  valorMaximo: Prisma.Decimal | number | null;
  termos: string | null;
  status: string;
  assinadoEm: Date | null;
  assinadoPor: string | null;
  encerradoEm: Date | null;
  observacoes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: ContratoProps = {
    id: record.id,
    orgId: record.orgId,
    representanteId: record.representanteId,
    numero: record.numero,
    dataInicio: record.dataInicio,
    dataFim: record.dataFim,
    percentualComissao: Number(record.percentualComissao),
    valorMinimo: record.valorMinimo ? Number(record.valorMinimo) : null,
    valorMaximo: record.valorMaximo ? Number(record.valorMaximo) : null,
    termos: record.termos,
    status: record.status as ContratoStatus,
    assinadoEm: record.assinadoEm,
    assinadoPor: record.assinadoPor,
    encerradoEm: record.encerradoEm,
    observacoes: record.observacoes,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Contrato.restaurar(props);
}

export class PrismaContratoRepository implements ContratoRepository {
  async salvar(contrato: Contrato) {
    const dados = contrato.dados;

    await prisma.contrato.upsert({
      where: { id: contrato.contratoId },
      create: {
        id: contrato.contratoId,
        orgId: dados.orgId,
        representanteId: dados.representanteId,
        numero: dados.numero,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        percentualComissao: dados.percentualComissao,
        valorMinimo: dados.valorMinimo,
        valorMaximo: dados.valorMaximo,
        termos: dados.termos,
        status: dados.status,
        assinadoEm: dados.assinadoEm,
        assinadoPor: dados.assinadoPor,
        encerradoEm: dados.encerradoEm,
        observacoes: dados.observacoes,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        dataFim: dados.dataFim,
        percentualComissao: dados.percentualComissao,
        valorMinimo: dados.valorMinimo,
        valorMaximo: dados.valorMaximo,
        termos: dados.termos,
        status: dados.status,
        assinadoEm: dados.assinadoEm,
        assinadoPor: dados.assinadoPor,
        encerradoEm: dados.encerradoEm,
        observacoes: dados.observacoes,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, contratoId: string) {
    const record = await prisma.contrato.findUnique({
      where: { id: contratoId },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorNumero(orgId: string, numero: string) {
    const record = await prisma.contrato.findFirst({
      where: { orgId, numero },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorRepresentante(
    orgId: string,
    representanteId: string,
    filtro?: { status?: ContratoStatus; cursor?: string; limite?: number },
  ) {
    const limit = Math.min(Math.max(filtro?.limite ?? 20, 1), 50);

    const andFilters: Prisma.ContratoWhereInput[] = [{ representanteId }];
    if (filtro?.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro?.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          {
            AND: [{ createdAt: cursor.createdAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where: Prisma.ContratoWhereInput = {
      orgId,
      AND: andFilters,
    };

    const records = await prisma.contrato.findMany({
      where,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  async listarVigentesPorRepresentante(orgId: string, representanteId: string) {
    const agora = new Date();

    const records = await prisma.contrato.findMany({
      where: {
        orgId,
        representanteId,
        status: "vigente",
        dataInicio: { lte: agora },
        OR: [{ dataFim: null }, { dataFim: { gte: agora } }],
      },
      orderBy: [{ dataInicio: "desc" }],
    });

    return records.map(toDomain);
  }
}

function encodeCursor(contrato: { id: string; createdAt: Date }) {
  const data = JSON.stringify({
    id: contrato.id,
    createdAt: contrato.createdAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      createdAt: string;
    };
    return {
      id: parsed.id,
      createdAt: new Date(parsed.createdAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
