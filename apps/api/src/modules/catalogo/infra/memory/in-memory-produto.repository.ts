import type {
  Produto,
  ProdutoListaFiltro,
  ProdutoListaPagina,
  ProdutoRepository,
} from "@morina/catalogo-domain";

export class InMemoryProdutoRepository implements ProdutoRepository {
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
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const itens = Array.from(this.items.values())
      .filter((produto) => produto.dados.orgId === orgId)
      .filter((produto) => (filtro.status ? produto.dados.status === filtro.status : true))
      .filter((produto) => {
        if (!filtro.busca) return true;
        const termo = filtro.busca.toLowerCase();
        return (
          produto.dados.nome.toLowerCase().includes(termo) ||
          (produto.dados.descricao ?? "").toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => {
        const diff =
          b.dados.atualizadoEm.getTime() - a.dados.atualizadoEm.getTime() ||
          b.produtoId.localeCompare(a.produtoId);
        return diff;
      });

    let startIndex = 0;
    if (filtro.cursor) {
      const decoded = decodeCursor(filtro.cursor);
      startIndex =
        itens.findIndex(
          (produto) =>
            produto.produtoId === decoded.id &&
            produto.dados.atualizadoEm.getTime() === decoded.atualizadoEm.getTime(),
        ) + 1;
      if (startIndex < 0) startIndex = 0;
    }

    const pageItems = itens.slice(startIndex, startIndex + limit);
    const last = pageItems.at(-1);

    return {
      itens: pageItems,
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }
}

function encodeCursor(produto: Produto) {
  const data = JSON.stringify({
    id: produto.produtoId,
    atualizadoEm: produto.dados.atualizadoEm.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      atualizadoEm: string;
    };
    return {
      id: parsed.id,
      atualizadoEm: new Date(parsed.atualizadoEm),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
