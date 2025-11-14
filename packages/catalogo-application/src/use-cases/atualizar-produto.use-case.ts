import type { ProdutoRepository } from "@morina/catalogo-domain";
import { ProdutoNotFoundError } from "../errors/produto-not-found.error";
import { atualizarProdutoInputSchema, produtoViewSchema } from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
  actorId: string;
};

export class AtualizarProdutoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarProdutoInputSchema.parse(rawInput);

    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.produtoId);

    if (!produto) {
      throw new ProdutoNotFoundError(input.produtoId);
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

    return produtoViewSchema.parse({
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
