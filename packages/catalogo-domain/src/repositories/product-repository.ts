import type { Produto } from "../entities/product";

export interface ProdutoRepository {
  salvar(produto: Produto): Promise<void>;
  encontrarPorId(orgId: string, produtoId: string): Promise<Produto | null>;
  encontrarPorNome(orgId: string, nome: string): Promise<Produto | null>;
}
