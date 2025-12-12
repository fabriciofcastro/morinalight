Object.defineProperty(exports, "__esModule", { value: true });
exports.listarAuditoriaFeedInputSchema = exports.ListarPrefichaAuditoriaFeedUseCase = void 0;
const zod_1 = require("zod");
const listarAuditoriaFeedInputSchema = zod_1.z.object({
  orgId: zod_1.z.string().min(1),
  acao: zod_1.z.string().optional(),
  cursor: zod_1.z.string().optional(),
  limite: zod_1.z.number().int().min(1).max(50).optional(),
  inicio: zod_1.z.date().optional(),
  fim: zod_1.z.date().optional(),
});
exports.listarAuditoriaFeedInputSchema = listarAuditoriaFeedInputSchema;
class ListarPrefichaAuditoriaFeedUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
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
exports.ListarPrefichaAuditoriaFeedUseCase = ListarPrefichaAuditoriaFeedUseCase;
