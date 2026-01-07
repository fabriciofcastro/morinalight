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
import {
    ProdutoAuditoria as ProdutoAuditoriaEntity,
    Produto as ProdutoEntity,
} from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { ListarAuditoriaFeedUseCase } from "../src/use-cases/list-audit-feed.use-case";

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

    return { itens, proximoCursor: undefined };
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
    return filtrar(itens, filtro);
  }

  async listarFeed(
    orgId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.items.filter((item) => item.dados.orgId === orgId);
    return filtrar(itens, filtro);
  }
}

function filtrar(
  itens: ProdutoAuditoria[],
  filtro: ProdutoAuditoriaFiltro,
): ProdutoAuditoriaPagina {
  let resultado = [...itens];

  if (filtro.acao) {
    resultado = resultado.filter((item) => item.dados.acao === filtro.acao);
  }

  const limite = Math.min(filtro.limite ?? resultado.length, resultado.length);

  return { itens: resultado.slice(0, limite), proximoCursor: undefined };
}

describe("ListarAuditoriaFeedUseCase", () => {
  const orgId = "org-1";

  it("retorna feed com resumo do produto associado", async () => {
    const produtoRepository = new InMemoryProdutoRepository();
    const auditoriaRepository = new InMemoryAuditoriaRepository();

    const produto = ProdutoEntity.criar({
      orgId,
      nome: "Produto Feed",
      descricao: "Registro",
      status: "ativo",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    await produtoRepository.salvar(produto);

    const auditoria = new ProdutoAuditoriaEntity({
      id: "11111111-1111-1111-1111-111111111111",
      produtoId: produto.produtoId,
      orgId,
      acao: "produto_aprovado",
      actorId: "user-approver",
      payload: { status: "ativo" },
      criadoEm: new Date(),
    });
    await auditoriaRepository.registrar(auditoria);

    const useCase = new ListarAuditoriaFeedUseCase({
      auditoriaRepository,
      produtoRepository,
    });

    const resultado = await useCase.execute({ orgId });

    expect(resultado.itens).toHaveLength(1);
    const item = resultado.itens[0]!;
    expect(item.acao).toBe("produto_aprovado");
    expect(item.produto?.nome).toBe("Produto Feed");
    expect(item.produto?.status).toBe("ativo");
  });
});
