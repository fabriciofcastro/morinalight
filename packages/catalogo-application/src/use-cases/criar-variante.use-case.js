Object.defineProperty(exports, "__esModule", { value: true });
exports.CriarVarianteUseCase = void 0;
const catalogo_domain_1 = require("@morina/catalogo-domain");
const produto_not_found_error_1 = require("../errors/produto-not-found.error");
const product_1 = require("../schemas/product");
class CriarVarianteUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = product_1.criarVarianteInputSchema.parse(rawInput);
    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.productId);
    if (!produto) {
      throw new produto_not_found_error_1.ProdutoNotFoundError(input.productId);
    }
    const varianteExistente = await this.deps.varianteRepository.encontrarPorSku(
      input.sku,
      input.orgId,
    );
    if (varianteExistente) {
      throw new Error("Variante com este SKU já existe");
    }
    const variante = catalogo_domain_1.ProductVariant.criar({
      productId: input.productId,
      orgId: input.orgId,
      sku: input.sku,
      nome: input.nome,
      atributos: input.atributos,
      preco: input.preco ?? null,
      estoque: input.estoque ?? null,
      ativo: input.ativo ?? true,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });
    await this.deps.varianteRepository.criar(variante);
    return product_1.varianteViewSchema.parse({
      varianteId: variante.varianteId,
      orgId: variante.dados.orgId,
      productId: variante.dados.productId,
      sku: variante.dados.sku,
      nome: variante.dados.nome,
      atributos: variante.dados.atributos,
      preco: variante.dados.preco ?? null,
      estoque: variante.dados.estoque ?? null,
      ativo: variante.dados.ativo,
      createdBy: variante.dados.createdBy,
      updatedBy: variante.dados.updatedBy,
      createdAt: variante.dados.createdAt,
      updatedAt: variante.dados.updatedAt,
    });
  }
}
exports.CriarVarianteUseCase = CriarVarianteUseCase;
