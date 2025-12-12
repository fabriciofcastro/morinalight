Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPrefichasInputSchema = exports.ListarPrefichasUseCase = void 0;
const preficha_1 = require("../schemas/preficha");
Object.defineProperty(exports, "listarPrefichasInputSchema", {
  enumerable: true,
  get: () => preficha_1.listarPrefichasInputSchema,
});
class ListarPrefichasUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = preficha_1.listarPrefichasInputSchema.parse(rawInput);
    const resultado = await this.deps.prefichaRepository.listarPorOrg(input.orgId, {
      status: input.status,
      produtoId: input.produtoId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });
    return {
      itens: resultado.itens.map((preficha) => ({
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
exports.ListarPrefichasUseCase = ListarPrefichasUseCase;
