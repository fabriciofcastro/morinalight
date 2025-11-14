import type { PrefichaAuditoria } from "../entities/preficha-audit-log";
export type PrefichaAuditoriaFiltro = {
    acao?: string;
    inicio?: Date;
    fim?: Date;
    cursor?: string;
    limite?: number;
};
export type PrefichaAuditoriaPagina = {
    itens: PrefichaAuditoria[];
    proximoCursor?: string;
};
export interface PrefichaAuditoriaRepository {
    registrar(log: PrefichaAuditoria): Promise<void>;
    listarPorPreficha(orgId: string, prefichaId: string, filtro?: PrefichaAuditoriaFiltro): Promise<PrefichaAuditoriaPagina>;
    listarFeed(orgId: string, filtro?: PrefichaAuditoriaFiltro): Promise<PrefichaAuditoriaPagina>;
}
