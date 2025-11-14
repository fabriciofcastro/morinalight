import type { Sector } from "../entities/sector";

export type { SectorProps, SectorStatus } from "../entities/sector";

export type SectorListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  departmentId?: string;
  parentId?: string | null;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type SectorListaPagina = {
  itens: Sector[];
  proximoCursor?: string;
};

export interface SectorRepository {
  salvar(sector: Sector): Promise<void>;
  encontrarPorId(orgId: string, sectorId: string): Promise<Sector | null>;
  encontrarPorCode(orgId: string, code: string): Promise<Sector | null>;
  listarPorOrg(orgId: string, filtro?: SectorListaFiltro): Promise<SectorListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, sectorId: string): Promise<void>;
}

