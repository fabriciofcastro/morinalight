import type { Preficha, PrefichaRepository } from "@morina/preficha-domain";

import { listarPrefichasInputSchema } from "../schemas/preficha";

type Dependencies = {
  prefichaRepository: PrefichaRepository;
};

export class ListarPrefichasUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPrefichasInputSchema.parse(rawInput);

    const resultado = await this.deps.prefichaRepository.listarPorOrg(input.orgId, {
      status: input.status,
      produtoId: input.produtoId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    return {
      itens: resultado.itens.map((preficha: Preficha) => ({
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
      })),
      proximoCursor: resultado.proximoCursor ?? null,
    };
  }
}

export { listarPrefichasInputSchema };
