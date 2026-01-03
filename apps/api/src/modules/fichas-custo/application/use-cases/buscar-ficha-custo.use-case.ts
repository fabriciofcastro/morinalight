import { z } from "zod";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import { fichaCustoViewSchema } from "../schemas/ficha-custo.schema";

const buscarFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
});

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  orgId: string;
};

export class BuscarFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = buscarFichaCustoSchema.parse(rawInput);

    const ficha = await this.deps.fichaCustoRepository.buscarPorId(
      input.fichaCustoId,
      this.deps.orgId,
    );

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

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
  }
}
