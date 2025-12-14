import { randomUUID } from "crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { aprovarTecnicamentePreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class AprovarTecnicamentePreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = aprovarTecnicamentePreFichaTecnicaSchema.parse(rawInput);

    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      input.preFichaTecnicaId,
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    preFicha.aprovarTecnicamente(
      input.aprovadorId,
      input.aprovadorNome,
      this.deps.actorId,
    );

    // Enviar automaticamente para avaliação da diretoria
    preFicha.enviarParaAvalDiretoria(this.deps.actorId);

    await this.deps.preFichaTecnicaRepository.salvar(preFicha);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "PreFichaTecnica.AprovadaTecnicamente",
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
          aprovadoPor: input.aprovadorId,
        },
      });
    }

    return {
      id: preFicha.preFichaTecnicaId,
      status: preFicha.status.valor,
    };
  }
}

