import type { Comissao } from "../../src/modules/clientes/domain/entities/comissao";
import type { ComissaoRepository, ComissaoFiltro } from "../../src/modules/clientes/domain/repositories/comissao-repository";

export class InMemoryComissaoRepository implements ComissaoRepository {
  private readonly items = new Map<string, Comissao>();

  async salvar(comissao: Comissao) {
    this.items.set(comissao.comissaoId, comissao);
  }

  async encontrarPorId(orgId: string, comissaoId: string) {
    const comissao = this.items.get(comissaoId);
    if (!comissao || comissao.dados.orgId !== orgId) return null;
    return comissao;
  }

  async encontrarPorVendaId(orgId: string, vendaId: string) {
    return (
      Array.from(this.items.values()).find(
        (c) => c.dados.orgId === orgId && c.dados.vendaId === vendaId,
      ) ?? null
    );
  }

  async listarPorOrg(orgId: string, filtro: ComissaoFiltro = {}) {
    const itens = Array.from(this.items.values())
      .filter((c) => c.dados.orgId === orgId)
      .filter((c) => {
        if (filtro.status && c.dados.status !== filtro.status) {
          return false;
        }
        if (filtro.representanteId && c.dados.representanteId !== filtro.representanteId) {
          return false;
        }
        if (filtro.clienteId && c.dados.clienteId !== filtro.clienteId) {
          return false;
        }
        return true;
      });

    return {
      itens,
      proximoCursor: undefined,
    };
  }

  async listarPendentes(orgId: string, representanteId?: string) {
    return Array.from(this.items.values())
      .filter((c) => c.dados.orgId === orgId)
      .filter((c) => c.dados.status === "pendente")
      .filter((c) => !representanteId || c.dados.representanteId === representanteId);
  }

  async listarPagas(orgId: string, representanteId?: string, _dataInicio?: Date, _dataFim?: Date) {
    return Array.from(this.items.values())
      .filter((c) => c.dados.orgId === orgId)
      .filter((c) => c.dados.status === "paga")
      .filter((c) => !representanteId || c.dados.representanteId === representanteId);
  }

  async contarPorStatus(orgId: string, status: string) {
    return Array.from(this.items.values()).filter(
      (c) => c.dados.orgId === orgId && c.dados.status === status,
    ).length;
  }

  async somarValorPorStatus(orgId: string, status: string) {
    return Array.from(this.items.values())
      .filter((c) => c.dados.orgId === orgId && c.dados.status === status)
      .reduce((sum, c) => sum + c.dados.valorComissao, 0);
  }
}
