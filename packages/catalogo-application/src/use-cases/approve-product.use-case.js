Object.defineProperty(exports, "__esModule", { value: true });
exports.AprovarProdutoUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const catalogo_domain_1 = require("@morina/catalogo-domain");
const produto_not_found_error_1 = require("../errors/produto-not-found.error");
const product_1 = require("../schemas/product");
class AprovarProdutoUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = product_1.aprovarProdutoInputSchema.parse(rawInput);
    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.produtoId);
    if (!produto) {
      throw new produto_not_found_error_1.ProdutoNotFoundError(input.produtoId);
    }
    produto.aprovar(this.deps.actorId);
    await this.deps.produtoRepository.salvar(produto);
    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new catalogo_domain_1.ProdutoAuditoria({
          id: (0, node_crypto_1.randomUUID)(),
          produtoId: produto.produtoId,
          orgId: input.orgId,
          acao: "produto_aprovado",
          actorId: this.deps.actorId,
          payload: null,
          criadoEm: new Date(),
        }),
      );
    }
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Catalogo.ProdutoAprovado",
        version: "v1",
        metadata: {
          eventId: (0, node_crypto_1.randomUUID)(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          produtoId: produto.produtoId,
          status: produto.dados.status,
        },
      });
    }
    return product_1.produtoViewSchema.parse({
      produtoId: produto.produtoId,
      orgId: produto.dados.orgId,
      nome: produto.dados.nome,
      descricao: produto.dados.descricao ?? null,
      status: produto.dados.status,
      criadoPor: produto.dados.criadoPor,
      atualizadoPor: produto.dados.atualizadoPor,
      criadoEm: produto.dados.criadoEm,
      atualizadoEm: produto.dados.atualizadoEm,
    });
  }
}
exports.AprovarProdutoUseCase = AprovarProdutoUseCase;
