Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarProdutoUseCase = void 0;
const produto_not_found_error_1 = require("../errors/produto-not-found.error");
const product_1 = require("../schemas/product");
class AtualizarProdutoUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = product_1.atualizarProdutoInputSchema.parse(rawInput);
    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.produtoId);
    if (!produto) {
      throw new produto_not_found_error_1.ProdutoNotFoundError(input.produtoId);
    }
    if (input.nome !== undefined) {
      produto.atualizarNome(input.nome, this.deps.actorId);
    }
    if (input.descricao !== undefined) {
      produto.atualizarDescricao(input.descricao, this.deps.actorId);
    }
    if (input.sku !== undefined) {
      produto.atualizarSku(input.sku, this.deps.actorId);
    }
    if (input.categoryId !== undefined) {
      produto.atualizarCategoria(input.categoryId, this.deps.actorId);
    }
    await this.deps.produtoRepository.salvar(produto);
    return product_1.produtoViewSchema.parse({
      produtoId: produto.produtoId,
      orgId: produto.dados.orgId,
      nome: produto.dados.nome,
      descricao: produto.dados.descricao ?? null,
      sku: produto.dados.sku ?? null,
      categoryId: produto.dados.categoryId ?? null,
      status: produto.dados.status,
      criadoPor: produto.dados.criadoPor,
      atualizadoPor: produto.dados.atualizadoPor,
      criadoEm: produto.dados.criadoEm,
      atualizadoEm: produto.dados.atualizadoEm,
    });
  }
}
exports.AtualizarProdutoUseCase = AtualizarProdutoUseCase;
