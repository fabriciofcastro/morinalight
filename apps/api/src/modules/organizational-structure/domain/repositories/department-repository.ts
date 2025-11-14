import type { Department } from "../entities/department";

export type DepartmentListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  unitId?: string | null;
  parentId?: string | null;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type DepartmentListaPagina = {
  itens: Department[];
  proximoCursor?: string;
};

export interface DepartmentRepository {
  salvar(department: Department): Promise<void>;
  encontrarPorId(orgId: string, departmentId: string): Promise<Department | null>;
  encontrarPorCode(orgId: string, code: string): Promise<Department | null>;
  listarPorOrg(orgId: string, filtro?: DepartmentListaFiltro): Promise<DepartmentListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, departmentId: string): Promise<void>;
}

