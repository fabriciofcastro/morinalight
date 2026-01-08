import type { DomainEventBus } from "@morina/shared-kernel";
import { randomUUID } from "crypto";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { reprovarPreFichaTecnicaSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  actorId: string;
  orgId: string;
};

export class ReprovarPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = reprovarPreFichaTecnicaSchema.parse(rawInput);

    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      input.preFichaTecnicaId,
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    preFicha.reprovar(
      input.reprovadorId,
      input.reprovadorNome,
      input.justificativa,
      this.deps.actorId,
    );

    await this.deps.preFichaTecnicaRepository.salvar(preFicha);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "PreFichaTecnica.Reprovada",
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
          reprovadoPor: input.reprovadorId,
          justificativa: input.justificativa,
        },
      });
    }

    return {
      id: preFicha.preFichaTecnicaId,
      status: preFicha.status.valor,
    };
  }
}
