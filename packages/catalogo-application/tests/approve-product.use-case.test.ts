import type {
    ProdutoAuditoria,
    ProdutoAuditoriaFiltro,
    ProdutoAuditoriaPagina,
    ProdutoAuditoriaRepository,
    ProdutoListaFiltro,
    ProdutoListaPagina,
    ProdutoRepository,
} from "@morina/catalogo-domain";
import { Produto } from "@morina/catalogo-domain";

import { describe, expect, it } from "vitest";

import { AprovarProdutoUseCase } from "../src/use-cases/approve-product.use-case";

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

    return {
      itens,
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
      (log) => log.dados.orgId === orgId && log.dados.produtoId === produtoId,
    );
    return filtrarAuditoria(itens, filtro);
  }

  async listarFeed(
    orgId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.items.filter((log) => log.dados.orgId === orgId);
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

describe("AprovarProdutoUseCase", () => {
  const actorId = "approver-1";
  const orgId = "org-1";

  it("aprova produto pendente", async () => {
    const repository = new InMemoryProdutoRepository();
    const auditoriaRepository = new InMemoryAuditoriaRepository();
    const produto = Produto.criar({
      orgId,
      nome: "Produto Y",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    produto.encaminharParaAprovacao("user-1");
    await repository.salvar(produto);

    const eventos: unknown[] = [];
    const eventBus = { publish: async (event: unknown) => { eventos.push(event); } };

    const useCase = new AprovarProdutoUseCase({
      produtoRepository: repository,
      actorId,
      eventBus,
      auditoriaRepository,
    });

    const resultado = await useCase.execute({ orgId, produtoId: produto.produtoId });

    expect(resultado.status).toBe("ativo");
    expect(eventos).toHaveLength(1);
    expect(auditoriaRepository.items).toHaveLength(1);
  });

  it("falha ao aprovar produto inexistente", async () => {
    const repository = new InMemoryProdutoRepository();
    const useCase = new AprovarProdutoUseCase({ produtoRepository: repository, actorId });

    await expect(
      useCase.execute({ orgId, produtoId: "49b2441c-4295-4be4-8ddb-f0f7898dff1d" }),
    ).rejects.toThrow("não encontrado");
  });
});
