import type { Position } from "../entities/position";

export type { PositionProps, PositionStatus } from "../entities/position";

export type PositionListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  sectorId?: string;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type PositionListaPagina = {
  itens: Position[];
  proximoCursor?: string;
};

export interface PositionRepository {
  salvar(position: Position): Promise<void>;
  encontrarPorId(orgId: string, positionId: string): Promise<Position | null>;
  encontrarPorCode(orgId: string, code: string): Promise<Position | null>;
  listarPorOrg(orgId: string, filtro?: PositionListaFiltro): Promise<PositionListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, positionId: string): Promise<void>;
}

