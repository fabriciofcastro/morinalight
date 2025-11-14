import type {
  ProdutoAuditoria,
  ProdutoAuditoriaFiltro,
  ProdutoAuditoriaPagina,
  ProdutoAuditoriaRepository,
} from "@morina/catalogo-domain";

export class InMemoryProdutoAuditoriaRepository implements ProdutoAuditoriaRepository {
  public readonly itens: ProdutoAuditoria[] = [];

  async registrar(log: ProdutoAuditoria) {
    this.itens.push(log);
  }

  async listarPorProduto(
    orgId: string,
    produtoId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.itens.filter(
      (item) => item.dados.orgId === orgId && item.dados.produtoId === produtoId,
    );

    return criarPagina(itens, filtro);
  }

  async listarFeed(
    orgId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const itens = this.itens.filter((item) => item.dados.orgId === orgId);
    return criarPagina(itens, filtro);
  }
}

function criarPagina(
  base: ProdutoAuditoria[],
  filtro: ProdutoAuditoriaFiltro,
): ProdutoAuditoriaPagina {
  let itens = [...base];

  if (filtro.acao) {
    itens = itens.filter((item) => item.dados.acao === filtro.acao);
  }

  if (filtro.inicio) {
    const inicio = filtro.inicio;
    itens = itens.filter((item) => item.dados.criadoEm >= inicio);
  }

  if (filtro.fim) {
    const fim = filtro.fim;
    itens = itens.filter((item) => item.dados.criadoEm <= fim);
  }

  itens = itens.sort((a, b) => b.dados.criadoEm.getTime() - a.dados.criadoEm.getTime());

  if (filtro.cursor) {
    const index = itens.findIndex((item) => item.dados.id === filtro.cursor);
    itens = index >= 0 ? itens.slice(index + 1) : itens;
  }

  const limite = Math.min(filtro.limite ?? 20, 100);
  const paginaItens = itens.slice(0, limite);
  const proximoCursor =
    paginaItens.length === limite ? paginaItens[paginaItens.length - 1].dados.id : undefined;

  return { itens: paginaItens, proximoCursor };
}
