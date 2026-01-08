import { randomUUID } from "crypto";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type { InsumoTecnicoProps } from "../../domain/entities/insumo-tecnico";
import { InsumoTecnico } from "../../domain/entities/insumo-tecnico";
import type { PreFichaTecnicaProps } from "../../domain/entities/pre-ficha-tecnica";
import { PreFichaTecnica } from "../../domain/entities/pre-ficha-tecnica";
import type { TecidoProps } from "../../domain/entities/tecido";
import { Tecido } from "../../domain/entities/tecido";
import type {
  PreFichaTecnicaFiltro,
  PreFichaTecnicaPagina,
  PreFichaTecnicaRepository,
} from "../../domain/repositories/pre-ficha-tecnica.repository";

const prisma = getPrisma();

function toDomain(record: any): PreFichaTecnica {
  const props: PreFichaTecnicaProps = {
    orgId: record.orgId,
    numeroSequencial: record.numeroSequencial,
    codigoPeca: record.codigoPeca,
    nomePecaPiloto: record.nomePecaPiloto,
    categoria: record.categoria,
    versaoMolde: record.versaoMolde,
    status: record.status as any,
    fotoPecaUrl: record.fotoPecaUrl,
    fotoPecaStorageKey: record.fotoPecaStorageKey,
    fotosAdicionais: record.fotosAdicionais as string[] | null,
    estilistaId: record.estilistaId,
    estilistaNome: record.estilistaNome,
    modelistaId: record.modelistaId,
    modelistaNome: record.modelistaNome,
    piloteiroId: record.piloteiroId,
    piloteiroNome: record.piloteiroNome,
    liberadoPorId: record.liberadoPorId,
    liberadoPorNome: record.liberadoPorNome,
    gradeTamanhos: record.gradeTamanhos as string[] | null,
    observacoesTecnicas: record.observacoesTecnicas,
    observacoesOficina: record.observacoesOficina,
    houveAlteracao: record.houveAlteracao,
    descricaoAlteracao: record.descricaoAlteracao,
    checklistTecnico: record.checklistTecnico as any,
    medidasCriticas: record.medidasCriticas,
    resultadoAvaliacao: record.resultadoAvaliacao,
    observacaoAvaliacao: record.observacaoAvaliacao,
    dataSubmissao: record.dataSubmissao,
    dataInicioRevisao: record.dataInicioRevisao,
    dataAprovacaoTecnica: record.dataAprovacaoTecnica,
    dataAprovacaoDiretoria: record.dataAprovacaoDiretoria,
    dataReprovacao: record.dataReprovacao,
    justificativaReprovacao: record.justificativaReprovacao,
    versaoAtual: record.versaoAtual,
    versaoAnteriorId: record.versaoAnteriorId,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  const preFicha = PreFichaTecnica.restaurar(props, record.id);

  // Restaurar tecidos
  const tecidosProps: TecidoProps[] = (record.tecidos || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((tecido: any) => ({
      tipo: tecido.tipo as any,
      nome: tecido.nome,
      especificacao: tecido.especificacao,
      consumo: Number(tecido.consumo),
      largura: Number(tecido.largura),
      quantidadePartes: tecido.quantidadePartes,
      observacoesTecnicas: tecido.observacoesTecnicas,
      ordem: tecido.ordem,
    }));

  preFicha.restaurarTecidos(tecidosProps);

  // Restaurar insumos técnicos
  const insumosProps: InsumoTecnicoProps[] = (record.insumosTecnicos || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((insumo: any) => ({
      descricao: insumo.descricao,
      tipo: insumo.tipo as any,
      quantidadeBase: Number(insumo.quantidadeBase),
      consumoPorTamanho: insumo.consumoPorTamanho as any,
      unidadeMedida: insumo.unidadeMedida as any,
      observacoesTecnicas: insumo.observacoesTecnicas,
      ordem: insumo.ordem,
    }));

  preFicha.restaurarInsumosTecnicos(insumosProps);

  return preFicha;
}

export class PrismaPreFichaTecnicaRepository implements PreFichaTecnicaRepository {
  async salvar(preFicha: PreFichaTecnica): Promise<void> {
    const dados = preFicha.dados;
    const tecidos = preFicha.tecidosList;
    const insumosTecnicos = preFicha.insumosTecnicosList;

    // Salvar pré-ficha (upsert)
    await prisma.preFichaTecnica.upsert({
      where: { id: preFicha.preFichaTecnicaId },
      create: {
        id: preFicha.preFichaTecnicaId,
        orgId: dados.orgId,
        numeroSequencial: dados.numeroSequencial,
        codigoPeca: dados.codigoPeca,
        nomePecaPiloto: dados.nomePecaPiloto,
        categoria: dados.categoria,
        versaoMolde: dados.versaoMolde,
        status: dados.status,
        fotoPecaUrl: dados.fotoPecaUrl,
        fotoPecaStorageKey: dados.fotoPecaStorageKey,
        fotosAdicionais: dados.fotosAdicionais,
        estilistaId: dados.estilistaId,
        estilistaNome: dados.estilistaNome,
        modelistaId: dados.modelistaId,
        modelistaNome: dados.modelistaNome,
        piloteiroId: dados.piloteiroId,
        piloteiroNome: dados.piloteiroNome,
        liberadoPorId: dados.liberadoPorId,
        liberadoPorNome: dados.liberadoPorNome,
        gradeTamanhos: dados.gradeTamanhos,
        observacoesTecnicas: dados.observacoesTecnicas,
        observacoesOficina: dados.observacoesOficina,
        houveAlteracao: dados.houveAlteracao,
        descricaoAlteracao: dados.descricaoAlteracao,
        checklistTecnico: dados.checklistTecnico,
        medidasCriticas: dados.medidasCriticas,
        resultadoAvaliacao: dados.resultadoAvaliacao,
        observacaoAvaliacao: dados.observacaoAvaliacao,
        dataSubmissao: dados.dataSubmissao,
        dataInicioRevisao: dados.dataInicioRevisao,
        dataAprovacaoTecnica: dados.dataAprovacaoTecnica,
        dataAprovacaoDiretoria: dados.dataAprovacaoDiretoria,
        dataReprovacao: dados.dataReprovacao,
        justificativaReprovacao: dados.justificativaReprovacao,
        versaoAtual: dados.versaoAtual,
        versaoAnteriorId: dados.versaoAnteriorId,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        codigoPeca: dados.codigoPeca,
        nomePecaPiloto: dados.nomePecaPiloto,
        categoria: dados.categoria,
        status: dados.status,
        fotoPecaUrl: dados.fotoPecaUrl,
        fotoPecaStorageKey: dados.fotoPecaStorageKey,
        fotosAdicionais: dados.fotosAdicionais,
        observacoesTecnicas: dados.observacoesTecnicas,
        observacoesOficina: dados.observacoesOficina,
        checklistTecnico: dados.checklistTecnico,
        medidasCriticas: dados.medidasCriticas,
        resultadoAvaliacao: dados.resultadoAvaliacao,
        observacaoAvaliacao: dados.observacaoAvaliacao,
        dataSubmissao: dados.dataSubmissao,
        dataInicioRevisao: dados.dataInicioRevisao,
        dataAprovacaoTecnica: dados.dataAprovacaoTecnica,
        dataAprovacaoDiretoria: dados.dataAprovacaoDiretoria,
        dataReprovacao: dados.dataReprovacao,
        justificativaReprovacao: dados.justificativaReprovacao,
        liberadoPorId: dados.liberadoPorId,
        liberadoPorNome: dados.liberadoPorNome,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });

    // Remover tecidos antigos
    await prisma.tecidoPreFichaTecnica.deleteMany({
      where: { preFichaTecnicaId: preFicha.preFichaTecnicaId },
    });

    // Criar novos tecidos
    if (tecidos.length > 0) {
      await prisma.tecidoPreFichaTecnica.createMany({
        data: tecidos.map((tecido, index) => {
          const tecidoData = tecido.toJSON();
          return {
            id: randomUUID(),
            preFichaTecnicaId: preFicha.preFichaTecnicaId,
            ordem: tecidoData.ordem ?? index,
            tipo: tecidoData.tipo,
            nome: tecidoData.nome,
            especificacao: tecidoData.especificacao,
            consumo: tecidoData.consumo,
            largura: tecidoData.largura,
            quantidadePartes: tecidoData.quantidadePartes,
            observacoesTecnicas: tecidoData.observacoesTecnicas,
          };
        }),
      });
    }

    // Remover insumos técnicos antigos
    await prisma.insumoTecnicoPreFichaTecnica.deleteMany({
      where: { preFichaTecnicaId: preFicha.preFichaTecnicaId },
    });

    // Criar novos insumos técnicos
    if (insumosTecnicos.length > 0) {
      await prisma.insumoTecnicoPreFichaTecnica.createMany({
        data: insumosTecnicos.map((insumo, index) => {
          const insumoData = insumo.toJSON();
          return {
            id: randomUUID(),
            preFichaTecnicaId: preFicha.preFichaTecnicaId,
            ordem: insumoData.ordem ?? index,
            descricao: insumoData.descricao,
            tipo: insumoData.tipo,
            quantidadeBase: insumoData.quantidadeBase,
            consumoPorTamanho: insumoData.consumoPorTamanho,
            unidadeMedida: insumoData.unidadeMedida,
            observacoesTecnicas: insumoData.observacoesTecnicas,
          };
        }),
      });
    }
  }

  async buscarPorId(id: string, orgId: string): Promise<PreFichaTecnica | null> {
    const record = await prisma.preFichaTecnica.findFirst({
      where: { id, orgId },
      include: {
        tecidos: { orderBy: { ordem: "asc" } },
        insumosTecnicos: { orderBy: { ordem: "asc" } },
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async buscarPorNumeroSequencial(numero: number, orgId: string): Promise<PreFichaTecnica | null> {
    const record = await prisma.preFichaTecnica.findFirst({
      where: { numeroSequencial: numero, orgId },
      include: {
        tecidos: { orderBy: { ordem: "asc" } },
        insumosTecnicos: { orderBy: { ordem: "asc" } },
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async buscarPorCodigoPeca(codigo: string, orgId: string): Promise<PreFichaTecnica[]> {
    const records = await prisma.preFichaTecnica.findMany({
      where: { codigoPeca: codigo, orgId },
      include: {
        tecidos: { orderBy: { ordem: "asc" } },
        insumosTecnicos: { orderBy: { ordem: "asc" } },
      },
      orderBy: { versaoMolde: "desc" },
    });

    return records.map(toDomain);
  }

  async listar(
    filtro: PreFichaTecnicaFiltro,
    pagina: number,
    tamanhoPagina: number,
  ): Promise<PreFichaTecnicaPagina> {
    const where: any = {
      orgId: filtro.orgId,
      deletedAt: null,
    };

    if (filtro.status && filtro.status.length > 0) {
      where.status = { in: filtro.status };
    }

    if (filtro.categoria) {
      where.categoria = filtro.categoria;
    }

    if (filtro.codigoPeca) {
      where.codigoPeca = { contains: filtro.codigoPeca, mode: "insensitive" };
    }

    if (filtro.criadoPor) {
      where.createdBy = filtro.criadoPor;
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
        { codigoPeca: { contains: filtro.busca, mode: "insensitive" } },
        { nomePecaPiloto: { contains: filtro.busca, mode: "insensitive" } },
        { categoria: { contains: filtro.busca, mode: "insensitive" } },
      ];
    }

    const [itens, total] = await Promise.all([
      prisma.preFichaTecnica.findMany({
        where,
        include: {
          tecidos: { orderBy: { ordem: "asc" } },
          insumosTecnicos: { orderBy: { ordem: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagina - 1) * tamanhoPagina,
        take: tamanhoPagina,
      }),
      prisma.preFichaTecnica.count({ where }),
    ]);

    return {
      itens: itens.map(toDomain),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async obterProximoNumeroSequencial(orgId: string): Promise<number> {
    const ultima = await prisma.preFichaTecnica.findFirst({
      where: { orgId },
      orderBy: { numeroSequencial: "desc" },
      select: { numeroSequencial: true },
    });

    return (ultima?.numeroSequencial ?? 0) + 1;
  }

  async existeNumeroSequencial(numero: number, orgId: string): Promise<boolean> {
    const existe = await prisma.preFichaTecnica.findFirst({
      where: { numeroSequencial: numero, orgId },
      select: { id: true },
    });

    return !!existe;
  }

  async contarPorStatus(orgId: string, status: string): Promise<number> {
    return prisma.preFichaTecnica.count({
      where: { orgId, status: status as any, deletedAt: null },
    });
  }

  async criarVersao(
    preFichaTecnicaId: string,
    orgId: string,
    dados: {
      versao: number;
      criadoPor: string;
      motivoAlteracao?: string | null;
      dadosSnapshot: any;
    },
  ): Promise<void> {
    await prisma.versaoPreFichaTecnica.create({
      data: {
        id: randomUUID(),
        preFichaTecnicaId,
        versao: dados.versao,
        criadoPor: dados.criadoPor,
        motivoAlteracao: dados.motivoAlteracao,
        dadosSnapshot: dados.dadosSnapshot,
      },
    });
  }
}
