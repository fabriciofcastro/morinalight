import type { OrganizationalUnit } from "../entities/organizational-unit";

export type OrganizationalUnitListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  parentId?: string | null;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type OrganizationalUnitListaPagina = {
  itens: OrganizationalUnit[];
  proximoCursor?: string;
};

export interface OrganizationalUnitRepository {
  salvar(unit: OrganizationalUnit): Promise<void>;
  encontrarPorId(orgId: string, unitId: string): Promise<OrganizationalUnit | null>;
  encontrarPorCode(orgId: string, code: string): Promise<OrganizationalUnit | null>;
  listarPorOrg(orgId: string, filtro?: OrganizationalUnitListaFiltro): Promise<OrganizationalUnitListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, unitId: string): Promise<void>;
}

