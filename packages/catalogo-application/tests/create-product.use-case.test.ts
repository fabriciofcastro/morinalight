import type {
  Produto,
  ProdutoAuditoria,
  ProdutoAuditoriaRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { CriarProdutoUseCase } from "../src/use-cases/create-product.use-case";

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
}

class InMemoryAuditoriaRepository implements ProdutoAuditoriaRepository {
  public readonly items: ProdutoAuditoria[] = [];

  async registrar(log: ProdutoAuditoria) {
    this.items.push(log);
  }

  async listarPorProduto(orgId: string, produtoId: string) {
    return this.items.filter(
      (item) => item.dados.orgId === orgId && item.dados.produtoId === produtoId,
    );
  }
}

describe("CriarProdutoUseCase", () => {
  const actorId = "user-actor";
  const orgId = "org-1";

  it("cria produto quando não existe duplicidade", async () => {
    const repository = new InMemoryProdutoRepository();
    const auditoriaRepository = new InMemoryAuditoriaRepository();
    const useCase = new CriarProdutoUseCase({
      produtoRepository: repository,
      actorId,
      auditoriaRepository,
    });

    const produto = await useCase.execute({ orgId, nome: "Produto X", descricao: "Teste" });

    expect(produto.produtoId).toBeDefined();
    expect(produto.nome).toBe("Produto X");
    expect(produto.criadoPor).toBe(actorId);
    expect(auditoriaRepository.items).toHaveLength(1);
  });

  it("lança erro ao tentar duplicar nome dentro da mesma organização", async () => {
    const repository = new InMemoryProdutoRepository();
    const useCase = new CriarProdutoUseCase({ produtoRepository: repository, actorId });

    await useCase.execute({ orgId, nome: "Produto X" });

    await expect(useCase.execute({ orgId, nome: "Produto X" })).rejects.toThrow(
      "Produto com este nome já existe",
    );
  });
});
