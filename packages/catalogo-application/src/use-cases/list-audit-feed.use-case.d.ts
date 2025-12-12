import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
type Dependencies = {
  auditoriaRepository: ProdutoAuditoriaRepository;
  produtoRepository: ProdutoRepository;
};
export declare class ListarAuditoriaFeedUseCase {
  private readonly deps;
  constructor(deps: Dependencies);
  execute(rawInput: unknown): Promise<{
    itens: {
      id: string;
      actorId: string;
      orgId: string;
      criadoEm: Date;
      produtoId: string;
      acao: string;
      payload?: unknown;
      produto?:
        | {
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
          }
        | null
        | undefined;
    }[];
    proximoCursor?: string | null | undefined;
  }>;
}
