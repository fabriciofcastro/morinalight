import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
type Dependencies = {
  produtoRepository: ProdutoRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};
export declare class CriarProdutoUseCase {
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
