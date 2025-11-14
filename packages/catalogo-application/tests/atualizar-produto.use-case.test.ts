import type { ProdutoRepository } from "@morina/catalogo-domain";
import { Produto } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { AtualizarProdutoUseCase } from "../src/use-cases/atualizar-produto.use-case";

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
    return { itens: [], proximoCursor: undefined };
  }
}

describe("AtualizarProdutoUseCase", () => {
  const actorId = "user-actor";
  const orgId = "org-1";

  it("atualiza nome do produto", async () => {
    const repository = new InMemoryProdutoRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Original",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await repository.salvar(produto);

    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: repository,
      actorId: "user-2",
    });

    const atualizado = await useCase.execute({
      orgId,
      produtoId: produto.produtoId,
      nome: "Produto Atualizado",
    });

    expect(atualizado.nome).toBe("Produto Atualizado");
    expect(atualizado.atualizadoPor).toBe("user-2");
  });

  it("atualiza SKU do produto", async () => {
    const repository = new InMemoryProdutoRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Teste",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await repository.salvar(produto);

    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: repository,
      actorId,
    });

    const atualizado = await useCase.execute({
      orgId,
      produtoId: produto.produtoId,
      sku: "SKU-123",
    });

    expect(atualizado.sku).toBe("SKU-123");
  });

  it("atualiza categoria do produto", async () => {
    const repository = new InMemoryProdutoRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Teste",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await repository.salvar(produto);

    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: repository,
      actorId,
    });

    const categoriaId = "cat-123";
    const atualizado = await useCase.execute({
      orgId,
      produtoId: produto.produtoId,
      categoryId: categoriaId,
    });

    expect(atualizado.categoryId).toBe(categoriaId);
  });

  it("atualiza múltiplos campos simultaneamente", async () => {
    const repository = new InMemoryProdutoRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Original",
      descricao: "Descrição original",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await repository.salvar(produto);

    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: repository,
      actorId,
    });

    const atualizado = await useCase.execute({
      orgId,
      produtoId: produto.produtoId,
      nome: "Produto Atualizado",
      descricao: "Nova descrição",
      sku: "SKU-456",
      categoryId: "cat-789",
    });

    expect(atualizado.nome).toBe("Produto Atualizado");
    expect(atualizado.descricao).toBe("Nova descrição");
    expect(atualizado.sku).toBe("SKU-456");
    expect(atualizado.categoryId).toBe("cat-789");
  });

  it("lança erro quando produto não existe", async () => {
    const repository = new InMemoryProdutoRepository();
    const useCase = new AtualizarProdutoUseCase({
      produtoRepository: repository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        produtoId: "produto-inexistente",
        nome: "Novo Nome",
      }),
    ).rejects.toThrow();
  });
});
