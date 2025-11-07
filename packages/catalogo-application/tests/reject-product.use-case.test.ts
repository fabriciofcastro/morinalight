import type {
  ProdutoAuditoria,
  ProdutoAuditoriaRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";

import { Produto } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { ReprovarProdutoUseCase } from "../src/use-cases/reject-product.use-case";

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
      (log) => log.dados.orgId === orgId && log.dados.produtoId === produtoId,
    );
  }
}

describe("ReprovarProdutoUseCase", () => {
  const actorId = "approver-1";
  const orgId = "org-1";

  it("reprova produto pendente com motivo", async () => {
    const repository = new InMemoryProdutoRepository();
    const auditoriaRepository = new InMemoryAuditoriaRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Z",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    produto.encaminharParaAprovacao("user-1");
    await repository.salvar(produto);

    const eventos: unknown[] = [];
    const eventBus = { publish: async (event: unknown) => eventos.push(event) };

    const useCase = new ReprovarProdutoUseCase({
      produtoRepository: repository,
      actorId,
      eventBus,
      auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId,
      produtoId: produto.produtoId,
      motivo: "Dados inconsistentes",
    });

    expect(resultado.status).toBe("inativo");
    expect(eventos).toHaveLength(1);
    expect(auditoriaRepository.items).toHaveLength(1);
  });

  it("falha ao reprovar produto inexistente", async () => {
    const repository = new InMemoryProdutoRepository();
    const useCase = new ReprovarProdutoUseCase({ produtoRepository: repository, actorId });

    await expect(
      useCase.execute({
        orgId,
        produtoId: "49b2441c-4295-4be4-8ddb-f0f7898dff1d",
        motivo: "Sem cadastro",
      }),
    ).rejects.toThrow("não encontrado");
  });
});
