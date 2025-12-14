import { getPrisma } from "../../../../infra/database/prisma.service";
import { FichaCusto } from "../../domain/entities/ficha-custo";
import { Insumo } from "../../domain/entities/insumo";
import type {
  FichaCustoFiltro,
  FichaCustoPagina,
  FichaCustoRepository,
} from "../../domain/repositories/ficha-custo.repository";
import type { FichaCustoProps } from "../../domain/entities/ficha-custo";
import type { InsumoProps } from "../../domain/entities/insumo";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  nomePeca: string;
  categoria: string | null;
  departmentId: string | null;
  sectorId: string | null;
  status: string;
  fotoPecaUrl: string | null;
  fotoPecaStorageKey: string | null;
  totalCustos: any; // Decimal do Prisma
  custoFinalPeca: any; // Decimal do Prisma
  criadoPor: string;
  aprovadoPor: string | null;
  reprovadoPor: string | null;
  responsavelFinanceiro: string | null;
  dataEnvioConferencia: Date | null;
  dataAprovacao: Date | null;
  dataReprovacao: Date | null;
  justificativaReprovacao: string | null;
  versaoAtual: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  insumos: Array<{
    id: string;
    ordem: number;
    descricao: string;
    tipo: string;
    fornecedorId: string | null;
    fornecedorNome: string | null;
    fornecedorCnpj: string | null;
    notaFiscalNumero: string | null;
    notaFiscalData: Date | null;
    notaFiscalValor: any | null;
    quantidade: any;
    unidadeMedida: string;
    custoUnitario: any;
      custoTotal: any;
      observacoes: string | null;
    }>;
  boletos?: Array<{
    id: string;
    insumoId: string | null;
    fornecedorId: string | null;
    fornecedorNome: string | null;
    arquivoUrl: string | null;
    arquivoStorageKey: string | null;
    valorBoleto: any;
    dataVencimento: Date;
    codigoBarras: string | null;
    linhaDigitavel: string | null;
    status: string;
    dataPagamento: Date | null;
    observacoes: string | null;
    anexadoPor: string;
    pagoPor: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  const props: FichaCustoProps = {
    orgId: record.orgId,
    numeroSequencial: record.numeroSequencial,
    referenciaPeca: record.referenciaPeca,
    nomePeca: record.nomePeca,
    categoria: record.categoria,
    departmentId: record.departmentId,
    sectorId: record.sectorId,
    status: record.status as any,
    fotoPecaUrl: record.fotoPecaUrl,
    fotoPecaStorageKey: record.fotoPecaStorageKey,
    totalCustos: Number(record.totalCustos),
    custoFinalPeca: Number(record.custoFinalPeca),
    criadoPor: record.criadoPor,
    aprovadoPor: record.aprovadoPor,
    reprovadoPor: record.reprovadoPor,
    responsavelFinanceiro: record.responsavelFinanceiro,
    dataEnvioConferencia: record.dataEnvioConferencia,
    dataAprovacao: record.dataAprovacao,
    dataReprovacao: record.dataReprovacao,
    justificativaReprovacao: record.justificativaReprovacao,
    versaoAtual: record.versaoAtual,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  const ficha = FichaCusto.restaurar(props, record.id);

  // Restaurar insumos
  const insumosProps: InsumoProps[] = record.insumos
    .sort((a, b) => a.ordem - b.ordem)
    .map((insumo) => ({
      descricao: insumo.descricao,
      tipo: insumo.tipo as any,
      fornecedorId: insumo.fornecedorId,
      fornecedorNome: insumo.fornecedorNome,
      fornecedorCnpj: insumo.fornecedorCnpj,
      notaFiscalNumero: insumo.notaFiscalNumero,
      notaFiscalData: insumo.notaFiscalData,
      notaFiscalValor: insumo.notaFiscalValor ? Number(insumo.notaFiscalValor) : null,
      quantidade: Number(insumo.quantidade),
      unidadeMedida: insumo.unidadeMedida,
      custoUnitario: Number(insumo.custoUnitario),
      observacoes: insumo.observacoes,
    }));

  ficha.restaurarInsumos(insumosProps);

  // Restaurar boletos se existirem
  if (record.boletos && record.boletos.length > 0) {
    const boletosProps = record.boletos.map((boleto) => ({
      id: boleto.id,
      fichaCustoId: record.id,
      insumoId: boleto.insumoId,
      fornecedorId: boleto.fornecedorId,
      fornecedorNome: boleto.fornecedorNome,
      arquivoUrl: boleto.arquivoUrl,
      arquivoStorageKey: boleto.arquivoStorageKey,
      valorBoleto: Number(boleto.valorBoleto),
      dataVencimento: boleto.dataVencimento,
      codigoBarras: boleto.codigoBarras,
      linhaDigitavel: boleto.linhaDigitavel,
      status: boleto.status as any,
      dataPagamento: boleto.dataPagamento,
      observacoes: boleto.observacoes,
      anexadoPor: boleto.anexadoPor,
      pagoPor: boleto.pagoPor,
      createdAt: boleto.createdAt,
      updatedAt: boleto.updatedAt,
    }));

    ficha.restaurarBoletos(boletosProps);
  }

  return ficha;
}

export class PrismaFichaCustoRepository implements FichaCustoRepository {
  async salvar(ficha: FichaCusto): Promise<void> {
    const dados = ficha.dados;
    const insumos = ficha.insumosList;

    // Salvar ficha (upsert)
    await prisma.fichaCusto.upsert({
      where: { id: ficha.fichaCustoId },
      create: {
        id: ficha.fichaCustoId,
        orgId: dados.orgId,
        numeroSequencial: dados.numeroSequencial,
        referenciaPeca: dados.referenciaPeca,
        nomePeca: dados.nomePeca,
        categoria: dados.categoria,
        departmentId: dados.departmentId,
        sectorId: dados.sectorId,
        status: dados.status,
        fotoPecaUrl: dados.fotoPecaUrl,
        fotoPecaStorageKey: dados.fotoPecaStorageKey,
        totalCustos: dados.totalCustos,
        custoFinalPeca: dados.custoFinalPeca,
        criadoPor: dados.criadoPor,
        aprovadoPor: dados.aprovadoPor,
        reprovadoPor: dados.reprovadoPor,
        responsavelFinanceiro: dados.responsavelFinanceiro,
        dataEnvioConferencia: dados.dataEnvioConferencia,
        dataAprovacao: dados.dataAprovacao,
        dataReprovacao: dados.dataReprovacao,
        justificativaReprovacao: dados.justificativaReprovacao,
        versaoAtual: dados.versaoAtual,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        referenciaPeca: dados.referenciaPeca,
        nomePeca: dados.nomePeca,
        categoria: dados.categoria,
        departmentId: dados.departmentId,
        sectorId: dados.sectorId,
        status: dados.status,
        fotoPecaUrl: dados.fotoPecaUrl,
        fotoPecaStorageKey: dados.fotoPecaStorageKey,
        totalCustos: dados.totalCustos,
        custoFinalPeca: dados.custoFinalPeca,
        aprovadoPor: dados.aprovadoPor,
        reprovadoPor: dados.reprovadoPor,
        responsavelFinanceiro: dados.responsavelFinanceiro,
        dataEnvioConferencia: dados.dataEnvioConferencia,
        dataAprovacao: dados.dataAprovacao,
        dataReprovacao: dados.dataReprovacao,
        justificativaReprovacao: dados.justificativaReprovacao,
        versaoAtual: dados.versaoAtual,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });

    // Remover insumos antigos
    await prisma.insumoFichaCusto.deleteMany({
      where: { fichaCustoId: ficha.fichaCustoId },
    });

    // Criar novos insumos
    await prisma.insumoFichaCusto.createMany({
      data: insumos.map((insumo, index) => {
        const insumoData = insumo.dados;
        return {
          id: `${ficha.fichaCustoId}-insumo-${index}`,
          fichaCustoId: ficha.fichaCustoId,
          ordem: index,
          descricao: insumoData.descricao,
          tipo: insumoData.tipo,
          fornecedorId: insumoData.fornecedorId,
          fornecedorNome: insumoData.fornecedorNome,
          fornecedorCnpj: insumoData.fornecedorCnpj,
          notaFiscalNumero: insumoData.notaFiscalNumero,
          notaFiscalData: insumoData.notaFiscalData,
          notaFiscalValor: insumoData.notaFiscalValor,
          quantidade: insumoData.quantidade,
          unidadeMedida: insumoData.unidadeMedida,
          custoUnitario: insumoData.custoUnitario,
          custoTotal: insumo.custoTotal.valorNumerico,
          observacoes: insumoData.observacoes,
        };
      }),
    });

    // Gerenciar boletos
    const boletos = ficha.boletosList;

    // Remover boletos que não estão mais na lista
    const boletosIds = boletos.map((b) => b.boletoId);
    await prisma.boletoFichaCusto.deleteMany({
      where: {
        fichaCustoId: ficha.fichaCustoId,
        NOT: { id: { in: boletosIds } },
      },
    });

    // Upsert boletos (criar ou atualizar)
    for (const boleto of boletos) {
      const boletoData = boleto.dados;
      await prisma.boletoFichaCusto.upsert({
        where: { id: boleto.boletoId },
        create: {
          id: boleto.boletoId,
          fichaCustoId: ficha.fichaCustoId,
          insumoId: boletoData.insumoId,
          fornecedorId: boletoData.fornecedorId,
          fornecedorNome: boletoData.fornecedorNome,
          arquivoUrl: boletoData.arquivoUrl,
          arquivoStorageKey: boletoData.arquivoStorageKey,
          valorBoleto: boletoData.valorBoleto,
          dataVencimento: boletoData.dataVencimento,
          codigoBarras: boletoData.codigoBarras,
          linhaDigitavel: boletoData.linhaDigitavel,
          status: boletoData.status,
          dataPagamento: boletoData.dataPagamento,
          observacoes: boletoData.observacoes,
          anexadoPor: boletoData.anexadoPor,
          pagoPor: boletoData.pagoPor,
        },
        update: {
          fornecedorId: boletoData.fornecedorId,
          fornecedorNome: boletoData.fornecedorNome,
          arquivoUrl: boletoData.arquivoUrl,
          arquivoStorageKey: boletoData.arquivoStorageKey,
          valorBoleto: boletoData.valorBoleto,
          dataVencimento: boletoData.dataVencimento,
          codigoBarras: boletoData.codigoBarras,
          linhaDigitavel: boletoData.linhaDigitavel,
          status: boletoData.status,
          dataPagamento: boletoData.dataPagamento,
          observacoes: boletoData.observacoes,
          pagoPor: boletoData.pagoPor,
        },
      });
    }
  }

  async buscarPorId(id: string, orgId: string): Promise<FichaCusto | null> {
    const record = await prisma.fichaCusto.findFirst({
      where: {
        id,
        orgId,
        deletedAt: null,
      },
      include: {
        insumos: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async buscarPorNumeroSequencial(
    numero: number,
    orgId: string,
  ): Promise<FichaCusto | null> {
    const record = await prisma.fichaCusto.findFirst({
      where: {
        numeroSequencial: numero,
        orgId,
        deletedAt: null,
      },
      include: {
        insumos: {
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async buscarPorReferencia(
    referencia: string,
    orgId: string,
  ): Promise<FichaCusto[]> {
    const records = await prisma.fichaCusto.findMany({
      where: {
        referenciaPeca: {
          contains: referencia,
          mode: "insensitive",
        },
        orgId,
        deletedAt: null,
      },
      include: {
        insumos: {
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return records.map((record) => toDomain(record));
  }

  async listar(
    filtro: FichaCustoFiltro,
    pagina: number,
    tamanhoPagina: number,
  ): Promise<FichaCustoPagina> {
    const where: any = {
      orgId: filtro.orgId,
      deletedAt: null,
    };

    if (filtro.status && filtro.status.length > 0) {
      where.status = { in: filtro.status };
    }

    if (filtro.departmentId) {
      where.departmentId = filtro.departmentId;
    }

    if (filtro.sectorId) {
      where.sectorId = filtro.sectorId;
    }

    if (filtro.referenciaPeca) {
      where.referenciaPeca = {
        contains: filtro.referenciaPeca,
        mode: "insensitive",
      };
    }

    if (filtro.criadoPor) {
      where.criadoPor = filtro.criadoPor;
    }

    if (filtro.dataInicio || filtro.dataFim) {
      where.createdAt = {};
      if (filtro.dataInicio) {
        where.createdAt.gte = filtro.dataInicio;
      }
      if (filtro.dataFim) {
        where.createdAt.lte = filtro.dataFim;
      }
    }

    if (filtro.busca) {
      where.OR = [
        { referenciaPeca: { contains: filtro.busca, mode: "insensitive" } },
        { nomePeca: { contains: filtro.busca, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.fichaCusto.count({ where }),
      prisma.fichaCusto.findMany({
        where,
        include: {
          insumos: {
            orderBy: { ordem: "asc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (pagina - 1) * tamanhoPagina,
        take: tamanhoPagina,
      }),
    ]);

    return {
      itens: records.map((record) => toDomain(record)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async obterProximoNumeroSequencial(orgId: string): Promise<number> {
    const ultimaFicha = await prisma.fichaCusto.findFirst({
      where: { orgId },
      orderBy: { numeroSequencial: "desc" },
      select: { numeroSequencial: true },
    });

    if (!ultimaFicha) {
      return 1;
    }

    return ultimaFicha.numeroSequencial + 1;
  }

  async existeNumeroSequencial(numero: number, orgId: string): Promise<boolean> {
    const count = await prisma.fichaCusto.count({
      where: {
        numeroSequencial: numero,
        orgId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async contarPorStatus(orgId: string, status: string): Promise<number> {
    return prisma.fichaCusto.count({
      where: {
        orgId,
        status: status as any,
        deletedAt: null,
      },
    });
  }
}
