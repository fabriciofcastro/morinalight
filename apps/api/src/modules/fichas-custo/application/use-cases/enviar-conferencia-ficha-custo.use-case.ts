import { randomUUID } from "node:crypto";

import type { DomainEventBus } from "@morina/shared-kernel";

import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";
import type { FichaCustoEnviadaConferenciaEvent } from "../../domain/events/ficha-custo-enviada-conferencia.event";
import { enviarConferenciaFichaCustoSchema } from "../schemas/ficha-custo.schema";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class EnviarConferenciaFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = enviarConferenciaFichaCustoSchema.parse(rawInput);

    // Buscar ficha
    const ficha = await this.deps.fichaCustoRepository.buscarPorId(
      input.fichaCustoId,
      this.deps.orgId,
    );

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

    // Verificar se pertence à organização
    if (ficha.dados.orgId !== this.deps.orgId) {
      throw new Error("Ficha de custo não pertence à organização");
    }

    // Enviar para conferência (valida internamente)
    ficha.enviarParaConferencia(this.deps.actorId);

    // Salvar alterações
    await this.deps.fichaCustoRepository.salvar(ficha);

    // Publicar evento de domínio
    if (this.deps.eventBus) {
      const dados = ficha.dados;
      await this.deps.eventBus.publish<FichaCustoEnviadaConferenciaEvent>({
        name: "FichaCusto.EnviadaParaConferencia",
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
          enviadoPor: this.deps.actorId,
          departmentId: dados.departmentId ?? null,
          sectorId: dados.sectorId ?? null,
          totalCustos: dados.totalCustos,
        },
      });
    }

    return {
      fichaCustoId: ficha.fichaCustoId,
      status: ficha.status.valor,
      dataEnvioConferencia: ficha.dados.dataEnvioConferencia,
    };
  }
}
