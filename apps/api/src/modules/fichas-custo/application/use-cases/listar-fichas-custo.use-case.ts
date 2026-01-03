import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import { filtroFichaCustoSchema, paginacaoFichaCustoSchema, fichaCustoViewSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  orgId: string;
};

export class ListarFichasCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const filtroInput = filtroFichaCustoSchema.parse(rawInput);
    const paginacao = paginacaoFichaCustoSchema.parse(rawInput);

    const filtro = {
      orgId: this.deps.orgId,
      ...filtroInput,
    };

    const resultado = await this.deps.fichaCustoRepository.listar(
      filtro,
      paginacao.pagina,
      paginacao.tamanhoPagina,
    );

    // Converter para views
    const itens = resultado.itens.map((ficha) => {
      const dados = ficha.dados;
      return fichaCustoViewSchema.parse({
        id: ficha.fichaCustoId,
        orgId: dados.orgId,
        numeroSequencial: dados.numeroSequencial,
        referenciaPeca: dados.referenciaPeca,
        nomePeca: dados.nomePeca,
        categoria: dados.categoria ?? null,
        departmentId: dados.departmentId ?? null,
        sectorId: dados.sectorId ?? null,
        status: dados.status,
        fotoPecaUrl: dados.fotoPecaUrl ?? null,
        totalCustos: dados.totalCustos,
        custoFinalPeca: dados.custoFinalPeca,
        criadoPor: dados.criadoPor,
        aprovadoPor: dados.aprovadoPor ?? null,
        reprovadoPor: dados.reprovadoPor ?? null,
        responsavelFinanceiro: dados.responsavelFinanceiro ?? null,
        dataEnvioConferencia: dados.dataEnvioConferencia ?? null,
        dataAprovacao: dados.dataAprovacao ?? null,
        dataReprovacao: dados.dataReprovacao ?? null,
        justificativaReprovacao: dados.justificativaReprovacao ?? null,
        versaoAtual: dados.versaoAtual,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
        insumos: ficha.insumosList.map((insumo) => ({
          descricao: insumo.descricao,
          tipo: insumo.tipo,
          fornecedorId: insumo.fornecedorId ?? null,
          fornecedorNome: insumo.fornecedorNome ?? null,
          notaFiscalNumero: insumo.notaFiscalNumero ?? null,
          quantidade: insumo.quantidade.valorNumerico,
          unidadeMedida: insumo.quantidade.unidadeMedida,
          custoUnitario: insumo.custoUnitario.valorNumerico,
          custoTotal: insumo.custoTotal.valorNumerico,
        })),
      });
    });

    return {
      itens,
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.tamanhoPagina,
      totalPaginas: resultado.totalPaginas,
    };
  }
}
