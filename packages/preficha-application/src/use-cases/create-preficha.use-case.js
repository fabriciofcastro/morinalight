Object.defineProperty(exports, "__esModule", { value: true });
exports.CriarPrefichaUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const preficha_domain_1 = require("@morina/preficha-domain");
const preficha_1 = require("../schemas/preficha");
class CriarPrefichaUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = preficha_1.criarPrefichaInputSchema.parse(rawInput);
    // Verificar se já existe uma preficha para este produto
    const prefichaExistente = await this.deps.prefichaRepository.encontrarPorProdutoId(
      input.orgId,
      input.produtoId,
    );
    if (prefichaExistente && prefichaExistente.dados.status !== "rejeitado") {
      throw new Error("Já existe uma preficha ativa para este produto");
    }
    const preficha = preficha_domain_1.Preficha.criar({
      orgId: input.orgId,
      produtoId: input.produtoId,
      aprovadores: input.aprovadoresIds.map((userId) => ({
        userId,
        aprovado: false,
        aprovadoEm: null,
        comentario: null,
      })),
      criadoPor: this.deps.actorId,
      atualizadoPor: this.deps.actorId,
    });
    await this.deps.prefichaRepository.salvar(preficha);
    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new preficha_domain_1.PrefichaAuditoria({
          id: node_crypto_1.randomUUID(),
          prefichaId: preficha.prefichaId,
          orgId: preficha.dados.orgId,
          acao: "preficha_criada",
          actorId: this.deps.actorId,
          payload: {
            produtoId: preficha.dados.produtoId,
            aprovadoresIds: input.aprovadoresIds,
          },
          criadoEm: new Date(),
        }),
      );
    }
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Preficha.Criada",
        version: "v1",
        metadata: {
          eventId: node_crypto_1.randomUUID(),
          orgId: preficha.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          prefichaId: preficha.prefichaId,
          produtoId: preficha.dados.produtoId,
          status: preficha.dados.status,
        },
      });
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
exports.CriarPrefichaUseCase = CriarPrefichaUseCase;
