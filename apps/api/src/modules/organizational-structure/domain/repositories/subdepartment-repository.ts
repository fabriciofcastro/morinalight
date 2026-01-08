import type { Subdepartment } from "../entities/subdepartment";

export type SubdepartmentListaFiltro = {
  status?: "ativo" | "inativo" | "arquivado";
  branchId?: string | null;
  departmentId?: string;
  parentId?: string | null;
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type SubdepartmentListaPagina = {
  itens: Subdepartment[];
  proximoCursor?: string;
};

export interface SubdepartmentRepository {
  salvar(subdepartment: Subdepartment): Promise<void>;
  encontrarPorId(orgId: string, subdepartmentId: string): Promise<Subdepartment | null>;
  encontrarPorCode(orgId: string, code: string): Promise<Subdepartment | null>;
  listarPorOrg(orgId: string, filtro?: SubdepartmentListaFiltro): Promise<SubdepartmentListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "arquivado"): Promise<number>;
  deletar(orgId: string, subdepartmentId: string): Promise<void>;
}
