import { getPrisma } from "../../../../infra/database/prisma.service";
import { Cliente } from "../../domain/entities/cliente";
import type {
  ClienteListaFiltro,
  ClienteListaPagina,
  ClienteProps,
  ClienteRepository,
  ClienteStatus,
} from "../../domain/repositories/cliente-repository";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  nome: string;
  razaoSocial: string | null;
  tipo: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  status: string;
  observacoes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: ClienteProps = {
    orgId: record.orgId,
    nome: record.nome,
    razaoSocial: record.razaoSocial,
    tipo: record.tipo as "fisica" | "juridica",
    documento: record.documento,
    email: record.email,
    telefone: record.telefone,
    celular: record.celular,
    endereco: record.endereco,
    cidade: record.cidade,
    estado: record.estado,
    cep: record.cep,
    status: record.status as ClienteStatus,
    observacoes: record.observacoes,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Cliente.restaurar(props, record.id);
}

export class PrismaClienteRepository implements ClienteRepository {
  async salvar(cliente: Cliente) {
    const dados = cliente.dados;

    await prisma.cliente.upsert({
      where: { id: cliente.clienteId },
      create: {
        id: cliente.clienteId,
        orgId: dados.orgId,
        nome: dados.nome,
        razaoSocial: dados.razaoSocial,
        tipo: dados.tipo,
        documento: dados.documento,
        email: dados.email,
        telefone: dados.telefone,
        celular: dados.celular,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        status: dados.status,
        observacoes: dados.observacoes,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        nome: dados.nome,
        razaoSocial: dados.razaoSocial,
        tipo: dados.tipo,
        email: dados.email,
        telefone: dados.telefone,
        celular: dados.celular,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        status: dados.status,
        observacoes: dados.observacoes,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(orgId: string, clienteId: string) {
    const record = await prisma.cliente.findUnique({ where: { id: clienteId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorDocumento(orgId: string, documento: string) {
    const record = await prisma.cliente.findFirst({
      where: { orgId, documento },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: ClienteListaFiltro = {}): Promise<ClienteListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro.busca) {
      andFilters.push({
        OR: [
          { nome: { contains: filtro.busca, mode: "insensitive" } },
          { documento: { contains: filtro.busca, mode: "insensitive" } },
          { email: { contains: filtro.busca, mode: "insensitive" } },
        ],
      });
    }
    if (filtro.cursor) {
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

    const records = await prisma.cliente.findMany({
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

  async contarPorOrg(orgId: string, status?: ClienteStatus): Promise<number> {
    return prisma.cliente.count({
      where: {
        orgId,
        ...(status && { status }),
      },
    });
  }
}

function encodeCursor(cliente: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: cliente.id,
    updatedAt: cliente.updatedAt.toISOString(),
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
