import type { DomainEventBus } from "@morina/shared-kernel";
import { randomUUID } from "crypto";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { aprovarDiretoriaPreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class AprovarDiretoriaPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = aprovarDiretoriaPreFichaTecnicaSchema.parse(rawInput);

    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      input.preFichaTecnicaId,
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    preFicha.aprovarDiretoria(input.aprovadorId, input.aprovadorNome, this.deps.actorId);

    await this.deps.preFichaTecnicaRepository.salvar(preFicha);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "PreFichaTecnica.LiberadaProducaoPiloto",
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
