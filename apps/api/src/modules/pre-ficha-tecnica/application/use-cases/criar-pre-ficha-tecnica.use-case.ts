import { randomUUID } from "crypto";

import type { DomainEventBus } from "@morina/shared-kernel";

import { PreFichaTecnica } from "../../domain/entities/pre-ficha-tecnica";
import { Tecido } from "../../domain/entities/tecido";
import { InsumoTecnico } from "../../domain/entities/insumo-tecnico";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { criarPreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class CriarPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarPreFichaTecnicaSchema.parse(rawInput);

    // Obter próximo número sequencial
    const numeroSequencial =
      await this.deps.preFichaTecnicaRepository.obterProximoNumeroSequencial(
        this.deps.orgId,
      );

    // Criar tecidos
    const tecidos = input.tecidos.map((tecidoData) =>
      Tecido.criar({
        tipo: tecidoData.tipo,
        nome: tecidoData.nome,
        especificacao: tecidoData.especificacao ?? null,
        consumo: tecidoData.consumo,
        largura: tecidoData.largura,
        quantidadePartes: tecidoData.quantidadePartes ?? null,
        observacoesTecnicas: tecidoData.observacoesTecnicas ?? null,
        ordem: tecidoData.ordem,
      }),
    );

    // Criar insumos técnicos
    const insumosTecnicos = input.insumosTecnicos.map((insumoData) =>
      InsumoTecnico.criar({
        descricao: insumoData.descricao,
        tipo: insumoData.tipo,
        quantidadeBase: insumoData.quantidadeBase,
        consumoPorTamanho: insumoData.consumoPorTamanho ?? null,
        unidadeMedida: insumoData.unidadeMedida,
        observacoesTecnicas: insumoData.observacoesTecnicas ?? null,
        ordem: insumoData.ordem,
      }),
    );

    // Criar pré-ficha técnica
    const preFicha = PreFichaTecnica.criar({
      orgId: this.deps.orgId,
      numeroSequencial,
      codigoPeca: input.codigoPeca,
      nomePecaPiloto: input.nomePecaPiloto,
      categoria: input.categoria ?? null,
      versaoMolde: input.versaoMolde ?? 1,
      fotoPecaUrl: input.fotoPecaUrl ?? null,
      fotoPecaStorageKey: input.fotoPecaStorageKey ?? null,
      gradeTamanhos: input.gradeTamanhos ?? null,
      observacoesTecnicas: input.observacoesTecnicas ?? null,
      observacoesOficina: input.observacoesOficina ?? null,
      estilistaId: input.estilistaId ?? null,
      estilistaNome: input.estilistaNome ?? null,
      modelistaId: input.modelistaId ?? null,
      modelistaNome: input.modelistaNome ?? null,
      piloteiroId: input.piloteiroId ?? null,
      piloteiroNome: input.piloteiroNome ?? null,
      criadoPor: this.deps.actorId,
    });

    // Adicionar tecidos
    tecidos.forEach((tecido) => {
      preFicha.adicionarTecido(tecido, this.deps.actorId);
    });

    // Adicionar insumos técnicos
    insumosTecnicos.forEach((insumo) => {
      preFicha.adicionarInsumoTecnico(insumo, this.deps.actorId);
    });

    // Atualizar responsáveis técnicos se fornecidos
    if (
      input.estilistaId ||
      input.estilistaNome ||
      input.modelistaId ||
      input.modelistaNome ||
      input.piloteiroId ||
      input.piloteiroNome
    ) {
      preFicha.atualizarResponsaveis(
        {
          estilistaId: input.estilistaId ?? null,
          estilistaNome: input.estilistaNome ?? null,
          modelistaId: input.modelistaId ?? null,
          modelistaNome: input.modelistaNome ?? null,
          piloteiroId: input.piloteiroId ?? null,
          piloteiroNome: input.piloteiroNome ?? null,
        },
        this.deps.actorId,
      );
    }

    // Salvar no repositório
    await this.deps.preFichaTecnicaRepository.salvar(preFicha);

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "PreFichaTecnica.Criada",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          preFichaTecnicaId: preFicha.preFichaTecnicaId,
          orgId: this.deps.orgId,
          codigoPeca: preFicha.codigoPeca,
          nomePecaPiloto: preFicha.nomePecaPiloto,
          criadoPor: this.deps.actorId,
        },
      });
    }

    return {
      id: preFicha.preFichaTecnicaId,
      numeroSequencial: preFicha.numeroSequencial,
      codigoPeca: preFicha.codigoPeca,
      nomePecaPiloto: preFicha.nomePecaPiloto,
      status: preFicha.status.valor,
    };
  }
}












