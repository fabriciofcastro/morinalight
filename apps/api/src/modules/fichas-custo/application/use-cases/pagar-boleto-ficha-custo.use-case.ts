import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { BoletoPagoFichaEvent } from "../../domain/events/boleto-pago-ficha.event";
import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import { pagarBoletoFichaCustoSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class PagarBoletoFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = pagarBoletoFichaCustoSchema.parse(rawInput);

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

    // Buscar boleto na ficha
    const boleto = ficha.buscarBoletoPorId(input.boletoId);

    if (!boleto) {
      throw new Error("Boleto não encontrado na ficha");
    }

    // Validar que boleto pode ser pago
    if (!boleto.status.podePagar()) {
      throw new Error(`Boleto não pode ser pago no status atual: ${boleto.status.valor}`);
    }

    // Pagar boleto
    ficha.pagarBoleto(input.boletoId, this.deps.actorId, input.dataPagamento);

    // Salvar no repository
    await this.deps.fichaCustoRepository.salvar(ficha);

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      const _dados = ficha.dados;
      const boletoData = boleto.dados;
      await this.deps.eventBus.publish<BoletoPagoFichaEvent>({
        name: "FichaCusto.BoletoPago",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: this.deps.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          boletoId: input.boletoId,
          fichaCustoId: input.fichaCustoId,
          orgId: this.deps.orgId,
          valorPago: boletoData.valorBoleto,
          dataPagamento: (input.dataPagamento ?? new Date()).toISOString(),
          pagoPor: this.deps.actorId,
        },
      });
    }

    // Buscar boleto atualizado
    const boletoAtualizado = ficha.buscarBoletoPorId(input.boletoId);

    // Retornar boleto atualizado
    return {
      boleto: boletoAtualizado?.toJSON(),
    };
  }
}
