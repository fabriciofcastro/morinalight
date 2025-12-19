import type { StatusCustomizado } from "../entities/status-customizado";

export interface ListarStatusCustomizadosInput {
  orgId: string;
  ativo?: boolean;
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
  ordenacao?: {
    campo: "nome" | "cor" | "ordem" | "createdAt";
    direcao: "asc" | "desc";
  };
}

export interface ListarStatusCustomizadosOutput {
  status: StatusCustomizado[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}

export interface StatusCustomizadoRepository {
  criar(status: StatusCustomizado): Promise<StatusCustomizado>;
  buscarPorId(id: string, orgId: string): Promise<StatusCustomizado | null>;
  listar(input: ListarStatusCustomizadosInput): Promise<ListarStatusCustomizadosOutput>;
  atualizar(status: StatusCustomizado): Promise<StatusCustomizado>;
  deletar(id: string, orgId: string, deletedBy: string): Promise<void>;
  buscarPorNome(orgId: string, nome: string): Promise<StatusCustomizado | null>;
  contarPorOrg(orgId: string, ativo?: boolean): Promise<number>;
}


