import { randomUUID } from "node:crypto";

import type { DomainEventBus } from "@morina/shared-kernel";

import { FichaCusto } from "../../domain/entities/ficha-custo";
import { Insumo } from "../../domain/entities/insumo";
import type { FichaCustoCriadaEvent } from "../../domain/events/ficha-custo-criada.event";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import { criarFichaCustoSchema, fichaCustoViewSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class CriarFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarFichaCustoSchema.parse(rawInput);

    // Obter próximo número sequencial
    const numeroSequencial = await this.deps.fichaCustoRepository.obterProximoNumeroSequencial(
      this.deps.orgId,
    );

    // Criar insumos
    const insumos = input.insumos.map((insumoData) =>
      Insumo.criar({
        descricao: insumoData.descricao,
        tipo: insumoData.tipo,
        fornecedorId: insumoData.fornecedorId ?? null,
        fornecedorNome: insumoData.fornecedorNome ?? null,
        fornecedorCnpj: insumoData.fornecedorCnpj ?? null,
        notaFiscalNumero: insumoData.notaFiscalNumero ?? null,
        notaFiscalData: insumoData.notaFiscalData ?? null,
        notaFiscalValor: insumoData.notaFiscalValor ?? null,
        quantidade: insumoData.quantidade,
        unidadeMedida: insumoData.unidadeMedida,
        custoUnitario: insumoData.custoUnitario,
        observacoes: insumoData.observacoes ?? null,
      }),
    );

    // Criar ficha de custo
    const ficha = FichaCusto.criar({
      orgId: this.deps.orgId,
      numeroSequencial,
      referenciaPeca: input.referenciaPeca,
      nomePeca: input.nomePeca,
      categoria: input.categoria ?? null,
      departmentId: input.departmentId ?? null,
      sectorId: input.sectorId ?? null,
      fotoPecaUrl: input.fotoPecaUrl ?? null,
      fotoPecaStorageKey: input.fotoPecaStorageKey ?? null,
      criadoPor: this.deps.actorId,
    });

    // Adicionar insumos
    insumos.forEach((insumo) => {
      ficha.adicionarInsumo(insumo, this.deps.actorId);
    });

    // Salvar no repositório
    await this.deps.fichaCustoRepository.salvar(ficha);

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      const dados = ficha.dados;
      await this.deps.eventBus.publish<FichaCustoCriadaEvent>({
        name: "FichaCusto.Criada",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          fichaCustoId: ficha.fichaCustoId,
          orgId: dados.orgId,
          numeroSequencial: dados.numeroSequencial,
          referenciaPeca: dados.referenciaPeca,
          nomePeca: dados.nomePeca,
          categoria: dados.categoria ?? null,
          departmentId: dados.departmentId ?? null,
          sectorId: dados.sectorId ?? null,
          criadoPor: dados.criadoPor,
          totalCustos: dados.totalCustos,
          custoFinalPeca: dados.custoFinalPeca,
        },
      });
    }

    // Retornar view
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
