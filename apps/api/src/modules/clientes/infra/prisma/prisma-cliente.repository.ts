import { getPrisma } from "../../../../infra/database/prisma.service";
import { Cliente } from "../../domain/entities/cliente";
import type {
  ClienteListaFiltro,
  ClienteListaPagina,
  ClienteRepository,
} from "../../domain/repositories/cliente-repository";
import type { Prisma } from "@prisma/client";
import type { ClienteProps, ClienteStatus } from "../../domain/entities/cliente";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  nome: string;
  nomeSocial?: string | null;
  razaoSocial: string | null;
  nomeFantasia?: string | null;
  tipo: string;
  documento: string;
  documentoValidade?: Date | null;
  situacaoCadastral?: string | null;
  fotoUrl?: string | null;
  rg?: string | null;
  orgaoEmissor?: string | null;
  dataNascimento?: Date | null;
  sexo?: string | null;
  estadoCivil?: string | null;
  nacionalidade?: string | null;
  naturalidadeCidade?: string | null;
  naturalidadeEstado?: string | null;
  tituloEleitor?: string | null;
  certidaoNascimento?: string | null;
  certidaoCasamento?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  inscricaoEstadual?: string | null;
  inscricaoMunicipal?: string | null;
  email: string | null;
  emailSecundario?: string | null;
  emailCorporativo?: string | null;
  telefone: string | null;
  telefoneComercial?: string | null;
  celular: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  endereco: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
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
    nomeSocial: record.nomeSocial ?? null,
    razaoSocial: record.razaoSocial,
    nomeFantasia: record.nomeFantasia ?? null,
    tipo: record.tipo as "fisica" | "juridica",
    documento: record.documento,
    documentoValidade: record.documentoValidade ?? null,
    situacaoCadastral: record.situacaoCadastral ?? null,
    fotoUrl: record.fotoUrl ?? null,
    rg: record.rg ?? null,
    orgaoEmissor: record.orgaoEmissor ?? null,
    dataNascimento: record.dataNascimento ?? null,
    sexo: (record.sexo as "masculino" | "feminino" | "outro" | "nao_informar") ?? null,
    estadoCivil: (record.estadoCivil as "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel") ?? null,
    nacionalidade: record.nacionalidade ?? null,
    naturalidadeCidade: record.naturalidadeCidade ?? null,
    naturalidadeEstado: record.naturalidadeEstado ?? null,
    tituloEleitor: record.tituloEleitor ?? null,
    certidaoNascimento: record.certidaoNascimento ?? null,
    certidaoCasamento: record.certidaoCasamento ?? null,
    nomeMae: record.nomeMae ?? null,
    nomePai: record.nomePai ?? null,
    inscricaoEstadual: record.inscricaoEstadual ?? null,
    inscricaoMunicipal: record.inscricaoMunicipal ?? null,
    email: record.email,
    emailSecundario: record.emailSecundario ?? null,
    emailCorporativo: record.emailCorporativo ?? null,
    telefone: record.telefone,
    telefoneComercial: record.telefoneComercial ?? null,
    celular: record.celular,
    whatsapp: record.whatsapp ?? null,
    telegram: record.telegram ?? null,
    website: record.website ?? null,
    endereco: record.endereco,
    numero: record.numero ?? null,
    complemento: record.complemento ?? null,
    bairro: record.bairro ?? null,
    cidade: record.cidade,
    estado: record.estado,
    cep: record.cep,
    pontoReferencia: record.pontoReferencia ?? null,
    latitude: record.latitude ?? null,
    longitude: record.longitude ?? null,
    codigoIBGE: record.codigoIBGE ?? null,
    codigoMunicipio: record.codigoMunicipio ?? null,
    regiao: record.regiao ?? null,
    zona: record.zona as "urbana" | "rural" | null,
    horarioPreferencialContato: record.horarioPreferencialContato ?? null,
    idiomaPreferido: record.idiomaPreferido ?? null,
    formaPreferidaComunicacao: record.formaPreferidaComunicacao as "email" | "telefone" | "whatsapp" | "telegram" | "presencial" | null,
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
        nomeSocial: dados.nomeSocial,
        razaoSocial: dados.razaoSocial,
        nomeFantasia: dados.nomeFantasia,
        tipo: dados.tipo,
        documento: dados.documento,
        documentoValidade: dados.documentoValidade,
        situacaoCadastral: dados.situacaoCadastral,
        fotoUrl: dados.fotoUrl,
        rg: dados.rg,
        orgaoEmissor: dados.orgaoEmissor,
        dataNascimento: dados.dataNascimento,
        sexo: dados.sexo,
        estadoCivil: dados.estadoCivil,
        nacionalidade: dados.nacionalidade,
        naturalidadeCidade: dados.naturalidadeCidade,
        naturalidadeEstado: dados.naturalidadeEstado,
        tituloEleitor: dados.tituloEleitor,
        certidaoNascimento: dados.certidaoNascimento,
        certidaoCasamento: dados.certidaoCasamento,
        nomeMae: dados.nomeMae,
        nomePai: dados.nomePai,
        inscricaoEstadual: dados.inscricaoEstadual,
        inscricaoMunicipal: dados.inscricaoMunicipal,
        email: dados.email,
        emailSecundario: dados.emailSecundario,
        emailCorporativo: dados.emailCorporativo,
        telefone: dados.telefone,
        telefoneComercial: dados.telefoneComercial,
        celular: dados.celular,
        whatsapp: dados.whatsapp,
        telegram: dados.telegram,
        website: dados.website,
        linkedin: dados.linkedin,
        facebook: dados.facebook,
        instagram: dados.instagram,
        twitter: dados.twitter,
        youtube: dados.youtube,
        blog: dados.blog,
        endereco: dados.endereco,
        pontoReferencia: dados.pontoReferencia,
        latitude: dados.latitude,
        longitude: dados.longitude,
        codigoIBGE: dados.codigoIBGE,
        codigoMunicipio: dados.codigoMunicipio,
        regiao: dados.regiao,
        zona: dados.zona,
        horarioPreferencialContato: dados.horarioPreferencialContato,
        idiomaPreferido: dados.idiomaPreferido,
        formaPreferidaComunicacao: dados.formaPreferidaComunicacao,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
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
        nomeSocial: dados.nomeSocial,
        razaoSocial: dados.razaoSocial,
        nomeFantasia: dados.nomeFantasia,
        tipo: dados.tipo,
        rg: dados.rg,
        orgaoEmissor: dados.orgaoEmissor,
        dataNascimento: dados.dataNascimento,
        sexo: dados.sexo,
        estadoCivil: dados.estadoCivil,
        nacionalidade: dados.nacionalidade,
        naturalidadeCidade: dados.naturalidadeCidade,
        naturalidadeEstado: dados.naturalidadeEstado,
        tituloEleitor: dados.tituloEleitor,
        certidaoNascimento: dados.certidaoNascimento,
        certidaoCasamento: dados.certidaoCasamento,
        nomeMae: dados.nomeMae,
        nomePai: dados.nomePai,
        inscricaoEstadual: dados.inscricaoEstadual,
        inscricaoMunicipal: dados.inscricaoMunicipal,
        email: dados.email,
        emailSecundario: dados.emailSecundario,
        emailCorporativo: dados.emailCorporativo,
        telefone: dados.telefone,
        telefoneComercial: dados.telefoneComercial,
        celular: dados.celular,
        whatsapp: dados.whatsapp,
        telegram: dados.telegram,
        website: dados.website,
        linkedin: dados.linkedin,
        facebook: dados.facebook,
        instagram: dados.instagram,
        twitter: dados.twitter,
        youtube: dados.youtube,
        blog: dados.blog,
        endereco: dados.endereco,
        pontoReferencia: dados.pontoReferencia,
        latitude: dados.latitude,
        longitude: dados.longitude,
        codigoIBGE: dados.codigoIBGE,
        codigoMunicipio: dados.codigoMunicipio,
        regiao: dados.regiao,
        zona: dados.zona,
        horarioPreferencialContato: dados.horarioPreferencialContato,
        idiomaPreferido: dados.idiomaPreferido,
        formaPreferidaComunicacao: dados.formaPreferidaComunicacao,
        numero: dados.numero,
        complemento: dados.complemento,
        bairro: dados.bairro,
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
    const record = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

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

    const andFilters: Prisma.ClienteWhereInput[] = [];
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

    const where: Prisma.ClienteWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.cliente.findMany({
      where,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
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
