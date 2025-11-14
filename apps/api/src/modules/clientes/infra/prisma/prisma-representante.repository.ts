import type { RepresentanteRepository } from "../../domain/repositories/representante-repository";
import type { RepresentanteProps, RepresentanteStatus } from "../../domain/entities/representante";
import { Representante } from "../../domain/entities/representante";
import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  clienteId: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  percentualComissao: number;
  status: string;
  observacoes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: RepresentanteProps = {
    orgId: record.orgId,
    clienteId: record.clienteId,
    nome: record.nome,
    documento: record.documento,
    email: record.email,
    telefone: record.telefone,
    celular: record.celular,
    endereco: record.endereco,
    cidade: record.cidade,
    estado: record.estado,
    cep: record.cep,
    percentualComissao: Number(record.percentualComissao),
    status: record.status as RepresentanteStatus,
    observacoes: record.observacoes,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Representante.restaurar(props, record.id);
}

export class PrismaRepresentanteRepository implements RepresentanteRepository {
  async salvar(representante: Representante) {
    const dados = representante.dados;

    await prisma.representante.upsert({
      where: { id: representante.representanteId },
      create: {
        id: representante.representanteId,
        orgId: dados.orgId,
        clienteId: dados.clienteId,
        nome: dados.nome,
        documento: dados.documento,
        email: dados.email,
        telefone: dados.telefone,
        celular: dados.celular,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        percentualComissao: dados.percentualComissao,
        status: dados.status,
        observacoes: dados.observacoes,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        nome: dados.nome,
        documento: dados.documento,
        email: dados.email,
        telefone: dados.telefone,
        celular: dados.celular,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        percentualComissao: dados.percentualComissao,
        status: dados.status,
        observacoes: dados.observacoes,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, representanteId: string) {
    const record = await prisma.representante.findUnique({
      where: { id: representanteId },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorClienteId(orgId: string, clienteId: string) {
    const record = await prisma.representante.findFirst({
      where: { orgId, clienteId },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    filtro?: { status?: "ativo" | "inativo" | "suspenso"; cursor?: string; limite?: number },
  ) {
    const limit = Math.min(Math.max(filtro?.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro?.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro?.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { updatedAt: { lt: cursor.updatedAt } },
          {
            AND: [{ updatedAt: cursor.updatedAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.representante.findMany({
      where,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }
}

function encodeCursor(representante: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: representante.id,
    updatedAt: representante.updatedAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      updatedAt: string;
    };
    return {
      id: parsed.id,
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}

