import type {
  PrefichaAuditoria,
  PrefichaAuditoriaFiltro,
  PrefichaAuditoriaPagina,
  PrefichaAuditoriaRepository,
} from "@morina/preficha-domain";

export class InMemoryPrefichaAuditoriaRepository implements PrefichaAuditoriaRepository {
  public readonly itens: PrefichaAuditoria[] = [];

  async registrar(log: PrefichaAuditoria) {
    this.itens.push(log);
  }

  async listarPorPreficha(
    orgId: string,
    prefichaId: string,
    filtro: PrefichaAuditoriaFiltro = {},
  ): Promise<PrefichaAuditoriaPagina> {
    const itens = this.itens.filter(
      (item) => item.dados.orgId === orgId && item.dados.prefichaId === prefichaId,
    );

    return criarPagina(itens, filtro);
  }

  async listarFeed(
    orgId: string,
    filtro: PrefichaAuditoriaFiltro = {},
  ): Promise<PrefichaAuditoriaPagina> {
    const itens = this.itens.filter((item) => item.dados.orgId === orgId);
    return criarPagina(itens, filtro);
  }
}

function criarPagina(
  base: PrefichaAuditoria[],
  filtro: PrefichaAuditoriaFiltro,
): PrefichaAuditoriaPagina {
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


