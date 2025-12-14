import { z } from "zod";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { PreFichaTecnicaId } from "../../domain/value-objects/pre-ficha-tecnica-id";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
  orgId: string;
  userId: string;
};

const atualizarChecklistSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  checklist: z.object({
    moldeVesteCorretamente: z.boolean().optional(),
    costuraViavel: z.boolean().optional(),
    insumosCompatíveis: z.boolean().optional(),
    pecaPilotoAprovadaVisualmente: z.boolean().optional(),
  }),
});

export class AtualizarChecklistTecnicoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarChecklistSchema.parse(rawInput);

    const preFichaId = PreFichaTecnicaId.from(input.preFichaTecnicaId);
    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      preFichaId.toString(),
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    // Atualizar checklist
    preFicha.atualizarChecklistTecnico(input.checklist, this.deps.userId);

    // Salvar
    await this.deps.preFichaTecnicaRepository.salvar(preFicha);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        type: "pre-ficha-tecnica.checklist-atualizado",
        payload: {
          id: preFicha.preFichaTecnicaId.toString(),
          orgId: this.deps.orgId,
          checklist: input.checklist,
        },
      });
    }

    return {
      id: preFicha.preFichaTecnicaId.toString(),
      checklist: preFicha.dados.checklistTecnico,
    };
  }
}

