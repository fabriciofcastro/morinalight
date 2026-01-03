import type {
  Preficha,
  PrefichaListaFiltro,
  PrefichaListaPagina,
  PrefichaRepository,
} from "@morina/preficha-domain";

export class InMemoryPrefichaRepository implements PrefichaRepository {
  private readonly items = new Map<string, Preficha>();

  async salvar(preficha: Preficha) {
    this.items.set(preficha.prefichaId, preficha);
  }

  async encontrarPorId(orgId: string, prefichaId: string) {
    const preficha = this.items.get(prefichaId);
    if (!preficha) return null;
    return preficha.dados.orgId === orgId ? preficha : null;
  }

  async encontrarPorProdutoId(orgId: string, produtoId: string) {
    return (
      Array.from(this.items.values()).find(
        (preficha) => preficha.dados.orgId === orgId && preficha.dados.produtoId === produtoId,
      ) ?? null
    );
  }

  async listarPorOrg(
    orgId: string,
    filtro: PrefichaListaFiltro = {},
  ): Promise<PrefichaListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const itens = Array.from(this.items.values())
      .filter((preficha) => preficha.dados.orgId === orgId)
      .filter((preficha) => (filtro.status ? preficha.dados.status === filtro.status : true))
      .filter((preficha) =>
        filtro.produtoId ? preficha.dados.produtoId === filtro.produtoId : true,
      )
      .filter((preficha) => {
        if (!filtro.busca) return true;
        const termo = filtro.busca.toLowerCase();
        return preficha.dados.produtoId.toLowerCase().includes(termo);
      })
      .sort((a, b) => {
        const diff =
          b.dados.atualizadoEm.getTime() - a.dados.atualizadoEm.getTime() ||
          b.prefichaId.localeCompare(a.prefichaId);
        return diff;
      });

    let startIndex = 0;
    if (filtro.cursor) {
      const decoded = decodeCursor(filtro.cursor);
      startIndex =
        itens.findIndex(
          (preficha) =>
            preficha.prefichaId === decoded.id &&
            preficha.dados.atualizadoEm.getTime() === decoded.atualizadoEm.getTime(),
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

function encodeCursor(preficha: Preficha) {
  const data = JSON.stringify({
    id: preficha.prefichaId,
    atualizadoEm: preficha.dados.atualizadoEm.toISOString(),
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
