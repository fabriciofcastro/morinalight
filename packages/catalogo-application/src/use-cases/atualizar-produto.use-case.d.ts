import type { ProdutoRepository } from "@morina/catalogo-domain";
type Dependencies = {
  produtoRepository: ProdutoRepository;
  actorId: string;
};
export declare class AtualizarProdutoUseCase {
  private readonly deps;
  constructor(deps: Dependencies);
  execute(rawInput: unknown): Promise<{
    status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
    orgId: string;
    criadoEm: Date;
    atualizadoEm: Date;
    nome: string;
    criadoPor: string;
    atualizadoPor: string;
    produtoId: string;
    descricao?: string | null | undefined;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
  }>;
}
