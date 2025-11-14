import type {
  Produto,
  ProdutoAuditoria,
  ProdutoAuditoriaFiltro,
  ProdutoAuditoriaPagina,
  ProdutoAuditoriaRepository,
  ProdutoListaFiltro,
  ProdutoListaPagina,
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

  async listarPorOrg(orgId: string, filtro: ProdutoListaFiltro = {}): Promise<ProdutoListaPagina> {
    let itens = Array.from(this.items.values()).filter((produto) => produto.dados.orgId === orgId);

    if (filtro.status) {
      itens = itens.filter((produto) => produto.dados.status === filtro.status);
    }

    if (filtro.busca) {
      const termo = filtro.busca.toLowerCase();
      itens = itens.filter(
        (produto) =>
          produto.dados.nome.toLowerCase().includes(termo) ||
          (produto.dados.descricao ?? "").toLowerCase().includes(termo),
      );
    }

    itens = itens.sort((a, b) => b.dados.atualizadoEm.getTime() - a.dados.atualizadoEm.getTime());

    const limite = Math.min(filtro.limite ?? itens.length, itens.length);

    return {
      itens: itens.slice(0, limite),
      proximoCursor: undefined,
    };
  }
}

class InMemoryAuditoriaRepository implements ProdutoAuditoriaRepository {
  public readonly items: ProdutoAuditoria[] = [];

  async registrar(log: ProdutoAuditoria) {
    this.items.push(log);
  }

  async listarPorProduto(
    orgId: string,
    produtoId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.items.filter(
      (item) => item.dados.orgId === orgId && item.dados.produtoId === produtoId,
    );
    return filtrarAuditoria(itens, filtro);
  }

  async listarFeed(
    orgId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.items.filter((item) => item.dados.orgId === orgId);
    return filtrarAuditoria(itens, filtro);
  }
}

function filtrarAuditoria(
  itens: ProdutoAuditoria[],
  filtro: ProdutoAuditoriaFiltro,
): ProdutoAuditoriaPagina {
  let resultado = [...itens];

  if (filtro.acao) {
    resultado = resultado.filter((item) => item.dados.acao === filtro.acao);
  }

  if (filtro.inicio) {
    resultado = resultado.filter((item) => item.dados.criadoEm >= filtro.inicio!);
  }

  if (filtro.fim) {
    resultado = resultado.filter((item) => item.dados.criadoEm <= filtro.fim!);
  }

  const limite = Math.min(filtro.limite ?? resultado.length, resultado.length);

  return {
    itens: resultado.slice(0, limite),
    proximoCursor: undefined,
  };
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
