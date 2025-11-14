import type { Team } from "../entities/team";

export type TeamListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  departmentId?: string | null;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type TeamListaPagina = {
  itens: Team[];
  proximoCursor?: string;
};

export interface TeamRepository {
  salvar(team: Team): Promise<void>;
  encontrarPorId(orgId: string, teamId: string): Promise<Team | null>;
  encontrarPorCode(orgId: string, code: string): Promise<Team | null>;
  listarPorOrg(orgId: string, filtro?: TeamListaFiltro): Promise<TeamListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, teamId: string): Promise<void>;
}

