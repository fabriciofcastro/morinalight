import type { PrefichaRepository } from "@morina/preficha-domain";

import { obterPrefichaInputSchema, prefichaViewSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
};

export class ObterPrefichaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = obterPrefichaInputSchema.parse(rawInput);

    const preficha = await this.deps.prefichaRepository.encontrarPorId(
      input.orgId,
      input.prefichaId,
    );
    if (!preficha) {
      throw new Error("Preficha não encontrada");
    }

    if (preficha.dados.orgId !== input.orgId) {
      throw new Error("Preficha não pertence à organização");
    }

    return prefichaViewSchema.parse({
      prefichaId: preficha.prefichaId,
      orgId: preficha.dados.orgId,
      produtoId: preficha.dados.produtoId,
      status: preficha.dados.status,
      aprovadores: preficha.dados.aprovadores,
      comentarios: preficha.dados.comentarios,
      criadoPor: preficha.dados.criadoPor,
      atualizadoPor: preficha.dados.atualizadoPor,
      criadoEm: preficha.dados.criadoEm,
      atualizadoEm: preficha.dados.atualizadoEm,
    });
  }
}


