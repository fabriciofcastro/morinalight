import type {
  Produto,
  ProdutoListaFiltro,
  ProdutoListaPagina,
  ProdutoRepository,
} from "@morina/catalogo-domain";
import { Produto as ProdutoEntity } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { ListarProdutosUseCase } from "../src/use-cases/list-products.use-case";

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

    itens = itens.sort((a, b) => b.dados.criadoEm.getTime() - a.dados.criadoEm.getTime());

    return {
      itens,
      proximoCursor: undefined,
    };
  }
}

describe("ListarProdutosUseCase", () => {
  const orgId = "org-1";

  it("lista produtos da organização aplicando filtros básicos", async () => {
    const repository = new InMemoryProdutoRepository();
    const ativo = ProdutoEntity.criar({
      orgId,
      nome: "Produto Ativo",
      descricao: "Aprovado",
      status: "ativo",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    const rascunho = ProdutoEntity.criar({
      orgId,
      nome: "Produto Rascunho",
      descricao: "Em progresso",
      status: "rascunho",
      criadoPor: "user-1",
      atualizadoPor: "user-1",
    });
    await repository.salvar(ativo);
    await repository.salvar(rascunho);

    const useCase = new ListarProdutosUseCase({ produtoRepository: repository });

    const todos = await useCase.execute({ orgId });
    expect(todos.itens).toHaveLength(2);

    const filtrado = await useCase.execute({ orgId, status: "ativo" });
    expect(filtrado.itens).toHaveLength(1);
    expect(filtrado.itens[0].nome).toBe("Produto Ativo");

    const busca = await useCase.execute({ orgId, busca: "rascunho" });
    expect(busca.itens).toHaveLength(1);
    expect(busca.itens[0].nome).toBe("Produto Rascunho");
  });
});
