import { randomUUID } from "node:crypto";
import { z } from "zod";

import type { DomainEventBus } from "@morina/shared-kernel";

import { Insumo } from "../../domain/entities/insumo";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import type { FichaCustoAtualizadaEvent } from "../../domain/events/ficha-custo-atualizada.event";
import { atualizarFichaCustoSchema, fichaCustoViewSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class AtualizarFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarFichaCustoSchema
      .extend({
        fichaCustoId: z.string().uuid(),
      })
      .parse(rawInput);

    // Buscar ficha existente
    const ficha = await this.deps.fichaCustoRepository.buscarPorId(
      input.fichaCustoId,
      this.deps.orgId,
    );

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

    // Campos alterados para auditoria
    const camposAlterados: string[] = [];

    // Atualizar dados básicos
    if (
      input.referenciaPeca !== undefined ||
      input.nomePeca !== undefined ||
      input.categoria !== undefined ||
      input.fotoPecaUrl !== undefined ||
      input.fotoPecaStorageKey !== undefined
    ) {
      ficha.atualizarDadosBasicos(
        {
          referenciaPeca: input.referenciaPeca,
          nomePeca: input.nomePeca,
          categoria: input.categoria ?? null,
          fotoPecaUrl: input.fotoPecaUrl ?? null,
          fotoPecaStorageKey: input.fotoPecaStorageKey ?? null,
        },
        this.deps.actorId,
      );

      if (input.referenciaPeca !== undefined) camposAlterados.push("referenciaPeca");
      if (input.nomePeca !== undefined) camposAlterados.push("nomePeca");
      if (input.categoria !== undefined) camposAlterados.push("categoria");
      if (input.fotoPecaUrl !== undefined) camposAlterados.push("fotoPecaUrl");
    }

    // Atualizar insumos se fornecido
    if (input.insumos !== undefined) {
      // Remover todos os insumos existentes
      ficha.insumosList.forEach((_, _index) => {
        ficha.removerInsumo(0, this.deps.actorId); // Sempre remover do índice 0 após cada remoção
      });

      // Adicionar novos insumos
      input.insumos.forEach((insumoData) => {
        const insumo = Insumo.criar({
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
        });

        ficha.adicionarInsumo(insumo, this.deps.actorId);
      });

      camposAlterados.push("insumos");
    }

    // Criar nova versão se houver alterações
    if (camposAlterados.length > 0) {
      ficha.criarNovaVersao(this.deps.actorId);
    }

    // Salvar alterações
    await this.deps.fichaCustoRepository.salvar(ficha);

    // Publicar evento de domínio
    if (this.deps.eventBus && camposAlterados.length > 0) {
      await this.deps.eventBus.publish<FichaCustoAtualizadaEvent>({
        name: "FichaCusto.Atualizada",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          fichaCustoId: ficha.fichaCustoId,
          orgId: this.deps.orgId,
          camposAlterados,
          versao: ficha.dados.versaoAtual,
        },
      });
    }

    // Retornar view atualizada
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
