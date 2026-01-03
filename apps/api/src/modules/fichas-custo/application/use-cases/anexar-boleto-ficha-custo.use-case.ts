import type { DomainEventBus } from "@morina/shared-kernel";
import { randomUUID } from "node:crypto";
import { Boleto } from "../../domain/entities/boleto";
import type { BoletoAnexadoFichaEvent } from "../../domain/events/boleto-anexado-ficha.event";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import { criarBoletoFichaCustoSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class AnexarBoletoFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarBoletoFichaCustoSchema.parse(rawInput);

    // Buscar ficha de custo
    const ficha = await this.deps.fichaCustoRepository.buscarPorId(
      input.fichaCustoId,
      this.deps.orgId,
    );

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

    // Validar que pertence à organização
    if (ficha.dados.orgId !== this.deps.orgId) {
      throw new Error("Ficha de custo não pertence à organização");
    }

    // Validar que ficha está aprovada
    if (!ficha.podeAnexarBoleto()) {
      throw new Error("Boleto só pode ser anexado a ficha aprovada");
    }

    // Criar entity Boleto
    const boleto = Boleto.criar({
      fichaCustoId: input.fichaCustoId,
      insumoId: input.insumoId ?? null,
      fornecedorId: input.fornecedorId ?? null,
      fornecedorNome: input.fornecedorNome ?? null,
      arquivoUrl: input.arquivoUrl ?? null,
      arquivoStorageKey: input.arquivoStorageKey ?? null,
      valorBoleto: input.valorBoleto,
      dataVencimento: input.dataVencimento,
      codigoBarras: input.codigoBarras ?? null,
      linhaDigitavel: input.linhaDigitavel ?? null,
      observacoes: input.observacoes ?? null,
      anexadoPor: this.deps.actorId,
    });

    // Validar valor do boleto não excede custo final
    if (!ficha.validarValorBoleto(boleto.valorBoleto)) {
      throw new Error(
        `Valor do boleto (${boleto.valorBoleto.formatar()}) excede o custo final da peça (${ficha.dados.custoFinalPeca})`,
      );
    }

    // Anexar boleto à ficha
    ficha.anexarBoleto(boleto, this.deps.actorId);

    // Salvar no repository
    await this.deps.fichaCustoRepository.salvar(ficha);

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      const _dados = ficha.dados;
      const boletoData = boleto.dados;
      await this.deps.eventBus.publish<BoletoAnexadoFichaEvent>({
        name: "FichaCusto.BoletoAnexado",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          boletoId: boleto.boletoId,
          fichaCustoId: input.fichaCustoId,
          orgId: this.deps.orgId,
          fornecedorId: boletoData.fornecedorId ?? null,
          fornecedorNome: boletoData.fornecedorNome ?? null,
          valorBoleto: boletoData.valorBoleto,
          dataVencimento: boletoData.dataVencimento.toISOString(),
          anexadoPor: this.deps.actorId,
        },
      });
    }

    // Retornar boleto criado
    return {
      boleto: boleto.toJSON(),
    };
  }
}











