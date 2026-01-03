import { z } from "zod";
import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  orgId: string;
};

const buscarPreFichaTecnicaSchema = z.object({
  id: z.string().uuid(),
});

export class BuscarPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = buscarPreFichaTecnicaSchema.parse(rawInput);

    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      input.id,
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    return {
      id: preFicha.preFichaTecnicaId,
      ...preFicha.dados,
      status: preFicha.status.valor,
      tecidos: preFicha.tecidosList.map((t) => t.toJSON()),
      insumosTecnicos: preFicha.insumosTecnicosList.map((i) => i.toJSON()),
    };
  }
}












