import type { Produto, ProdutoStatus } from "../entities/product";
export type ProdutoListaFiltro = {
  status?: ProdutoStatus;
  busca?: string;
  cursor?: string;
  limite?: number;
};
export type ProdutoListaPagina = {
  itens: Produto[];
  proximoCursor?: string;
};
export interface ProdutoRepository {
  salvar(produto: Produto): Promise<void>;
  encontrarPorId(orgId: string, produtoId: string): Promise<Produto | null>;
  encontrarPorNome(orgId: string, nome: string): Promise<Produto | null>;
  listarPorOrg(orgId: string, filtro?: ProdutoListaFiltro): Promise<ProdutoListaPagina>;
}
