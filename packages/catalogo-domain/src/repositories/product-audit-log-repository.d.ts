import type { ProdutoAuditoria } from "../entities/product-audit-log";
export type ProdutoAuditoriaFiltro = {
    acao?: string;
    limite?: number;
    cursor?: string;
    inicio?: Date;
    fim?: Date;
};
export type ProdutoAuditoriaPagina = {
    itens: ProdutoAuditoria[];
    proximoCursor?: string;
};
export interface ProdutoAuditoriaRepository {
    registrar(log: ProdutoAuditoria): Promise<void>;
    listarPorProduto(orgId: string, produtoId: string, filtro?: ProdutoAuditoriaFiltro): Promise<ProdutoAuditoriaPagina>;
    listarFeed(orgId: string, filtro?: ProdutoAuditoriaFiltro): Promise<ProdutoAuditoriaPagina>;
}
