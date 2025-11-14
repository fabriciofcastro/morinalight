import type { ProdutoRepository } from "@morina/catalogo-domain";
import { Produto } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { ProdutoNotFoundError } from "../src/errors/produto-not-found.error";
import { ObterProdutoUseCase } from "../src/use-cases/get-product.use-case";

class InMemoryProdutoRepository implements ProdutoRepository {
  private readonly items = new Map<string, Produto>();

  async salvar(produto: Produto) {
    this.items.set(produto.produtoId, produto);
  }

  async encontrarPorId(orgId: string, produtoId: string) {
    const produto = this.items.get(produtoId);
    if (!produto) return null;
    return produto.dados.orgId === orgId ? produto : null;
  }

  async encontrarPorNome(orgId: string, nome: string) {
    return (
      Array.from(this.items.values()).find(
        (produto) => produto.dados.orgId === orgId && produto.dados.nome === nome,
      ) ?? null
    );
  }

  async listarPorOrg() {
    return { itens: Array.from(this.items.values()), proximoCursor: undefined };
  }
}

describe("ObterProdutoUseCase", () => {
  const orgId = "org-1";

  it("retorna dados completos do produto quando encontrado", async () => {
    const repository = new InMemoryProdutoRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto X",
      descricao: "Teste",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    await repository.salvar(produto);

    const useCase = new ObterProdutoUseCase({ produtoRepository: repository });

    const resultado = await useCase.execute({ orgId, produtoId: produto.produtoId });

    expect(resultado.nome).toBe("Produto X");
    expect(resultado.produtoId).toBe(produto.produtoId);
  });

  it("lança erro quando produto não é encontrado", async () => {
    const repository = new InMemoryProdutoRepository();
    const useCase = new ObterProdutoUseCase({ produtoRepository: repository });

    await expect(
      useCase.execute({
        orgId,
        produtoId: "4b20a66d-2b0a-4f51-8032-fbd9ff5b6fdc",
      }),
    ).rejects.toBeInstanceOf(ProdutoNotFoundError);
  });
});

