import type { ProdutoRepository } from "@morina/catalogo-domain";

import {
  listarProdutosInputSchema,
  listarProdutosResultadoSchema,
  produtoViewSchema,
} from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
};

export class ListarProdutosUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarProdutosInputSchema.parse(rawInput);

    const pagina = await this.deps.produtoRepository.listarPorOrg(input.orgId, {
      status: input.status,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((produto) =>
      produtoViewSchema.parse({
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

    return listarProdutosResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
