import type { Comissao } from "../entities/comissao";

export type ComissaoFiltro = {
  status?: "pendente" | "calculada" | "paga" | "cancelada";
  representanteId?: string;
  clienteId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  cursor?: string;
  limite?: number;
};

export interface ComissaoRepository {
  salvar(comissao: Comissao): Promise<void>;
  encontrarPorId(orgId: string, comissaoId: string): Promise<Comissao | null>;
  encontrarPorVendaId(orgId: string, vendaId: string): Promise<Comissao | null>;
  listarPorOrg(
    orgId: string,
    filtro?: ComissaoFiltro,
  ): Promise<{ itens: Comissao[]; proximoCursor?: string }>;
  listarPendentes(orgId: string, representanteId?: string): Promise<Comissao[]>;
  listarPagas(
    orgId: string,
    representanteId?: string,
    dataInicio?: Date,
    dataFim?: Date,
  ): Promise<Comissao[]>;
  contarPorStatus(orgId: string, status: string): Promise<number>;
  somarValorPorStatus(orgId: string, status: string): Promise<number>;
}
