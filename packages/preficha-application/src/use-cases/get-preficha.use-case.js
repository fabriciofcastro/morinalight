Object.defineProperty(exports, "__esModule", { value: true });
exports.ObterPrefichaUseCase = void 0;
const preficha_1 = require("../schemas/preficha");
class ObterPrefichaUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = preficha_1.obterPrefichaInputSchema.parse(rawInput);
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
    return preficha_1.prefichaViewSchema.parse({
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
exports.ObterPrefichaUseCase = ObterPrefichaUseCase;
