import type { Preficha } from "../entities/preficha";

export type PrefichaListaFiltro = {
  status?: Preficha["dados"]["status"];
  produtoId?: string;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type PrefichaListaPagina = {
  itens: Preficha[];
  proximoCursor?: string;
};

export interface PrefichaRepository {
  salvar(preficha: Preficha): Promise<void>;
  encontrarPorId(orgId: string, prefichaId: string): Promise<Preficha | null>;
  listarPorOrg(orgId: string, filtro?: PrefichaListaFiltro): Promise<PrefichaListaPagina>;
  encontrarPorProdutoId(orgId: string, produtoId: string): Promise<Preficha | null>;
}


