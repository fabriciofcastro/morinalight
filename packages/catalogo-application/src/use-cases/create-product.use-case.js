Object.defineProperty(exports, "__esModule", { value: true });
exports.CriarProdutoUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const catalogo_domain_1 = require("@morina/catalogo-domain");
const product_1 = require("../schemas/product");
class CriarProdutoUseCase {
  deps;
  constructor(deps) {
    this.deps = deps;
  }
  async execute(rawInput) {
    const input = product_1.criarProdutoInputSchema.parse(rawInput);
    const produtoExistente = await this.deps.produtoRepository.encontrarPorNome(
      input.orgId,
      input.nome,
    );
    if (produtoExistente) {
      throw new Error("Produto com este nome já existe");
    }
    const produto = catalogo_domain_1.Produto.criar({
      orgId: input.orgId,
      nome: input.nome,
      descricao: input.descricao,
      sku: input.sku ?? null,
      categoryId: input.categoryId ?? null,
      criadoPor: this.deps.actorId,
      atualizadoPor: this.deps.actorId,
    });
    await this.deps.produtoRepository.salvar(produto);
    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new catalogo_domain_1.ProdutoAuditoria({
          id: (0, node_crypto_1.randomUUID)(),
          produtoId: produto.produtoId,
          orgId: produto.dados.orgId,
          acao: "produto_criado",
          actorId: this.deps.actorId,
          payload: {
            nome: produto.dados.nome,
            descricao: produto.dados.descricao ?? null,
          },
          criadoEm: new Date(),
        }),
      );
    }
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Catalogo.ProdutoCadastrado",
        version: "v1",
        metadata: {
          eventId: (0, node_crypto_1.randomUUID)(),
          orgId: produto.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          produtoId: produto.produtoId,
          status: produto.dados.status,
          nome: produto.dados.nome,
        },
      });
    }
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
exports.CriarProdutoUseCase = CriarProdutoUseCase;
