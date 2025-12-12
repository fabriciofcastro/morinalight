Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarProdutosUseCase = void 0;
const product_1 = require("../schemas/product");
class ListarProdutosUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = product_1.listarProdutosInputSchema.parse(rawInput);
    const pagina = await this.deps.produtoRepository.listarPorOrg(input.orgId, {
      status: input.status,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });
    const itens = pagina.itens.map((produto) =>
      product_1.produtoViewSchema.parse({
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
      }),
    );
    return product_1.listarProdutosResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
exports.ListarProdutosUseCase = ListarProdutosUseCase;
