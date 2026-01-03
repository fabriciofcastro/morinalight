import type { ProdutoRepository } from "@morina/catalogo-domain";

import { ProdutoNotFoundError } from "../errors/produto-not-found.error";
import { obterProdutoInputSchema, produtoViewSchema } from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
};

export class ObterProdutoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = obterProdutoInputSchema.parse(rawInput);

    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.produtoId);

    if (!produto) {
      throw new ProdutoNotFoundError(input.produtoId);
    }

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
