import type {
  PrefichaAuditoriaRepository,
  PrefichaRepository,
} from "@morina/preficha-domain";

import { z } from "zod";

const listarAuditoriaFeedInputSchema = z.object({
  orgId: z.string().min(1),
  acao: z.string().optional(),
  cursor: z.string().optional(),
  limite: z.number().int().min(1).max(50).optional(),
  inicio: z.date().optional(),
  fim: z.date().optional(),
});

type Dependencies = {
  prefichaAuditoriaRepository: PrefichaAuditoriaRepository;
  prefichaRepository: PrefichaRepository;
};

export class ListarPrefichaAuditoriaFeedUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarAuditoriaFeedInputSchema.parse(rawInput);

    const feed = await this.deps.prefichaAuditoriaRepository.listarFeed(input.orgId, {
      acao: input.acao,
      cursor: input.cursor,
      limite: input.limite,
      inicio: input.inicio,
      fim: input.fim,
    });

    // Buscar prefichas relacionadas
    const prefichas = await Promise.all(
      feed.itens.map(async (item) => {
        const preficha = await this.deps.prefichaRepository.encontrarPorId(
          input.orgId,
          item.dados.prefichaId,
        );
        return { item, preficha };
      }),
    );

    return {
      itens: prefichas.map(({ item, preficha }) => ({
        id: item.dados.id,
        acao: item.dados.acao,
        criadoEm: item.dados.criadoEm,
        actorId: item.dados.actorId,
        payload: item.dados.payload,
        preficha: preficha
          ? {
              prefichaId: preficha.prefichaId,
              produtoId: preficha.dados.produtoId,
              status: preficha.dados.status,
            }
          : null,
      })),
      proximoCursor: feed.proximoCursor ?? null,
    };
  }
}

export { listarAuditoriaFeedInputSchema };

