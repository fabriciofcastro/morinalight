import type { FichaCusto } from "../entities/ficha-custo";

export type FichaCustoFiltro = {
  orgId: string;
  status?: string[];
  departmentId?: string;
  sectorId?: string;
  referenciaPeca?: string;
  criadoPor?: string;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string; // Busca full-text
};

export type FichaCustoPagina = {
  itens: FichaCusto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
};

export interface FichaCustoRepository {
  /**
   * Salvar ou atualizar ficha de custo
   */
  salvar(ficha: FichaCusto): Promise<void>;

  /**
   * Buscar por ID
   */
  buscarPorId(id: string, orgId: string): Promise<FichaCusto | null>;

  /**
   * Buscar por número sequencial
   */
  buscarPorNumeroSequencial(
    numero: number,
    orgId: string,
  ): Promise<FichaCusto | null>;

  /**
   * Buscar por referência da peça
   */
  buscarPorReferencia(referencia: string, orgId: string): Promise<FichaCusto[]>;

  /**
   * Listar fichas com filtros e paginação
   */
  listar(filtro: FichaCustoFiltro, pagina: number, tamanhoPagina: number): Promise<FichaCustoPagina>;

  /**
   * Obter próximo número sequencial para uma organização
   */
  obterProximoNumeroSequencial(orgId: string): Promise<number>;

  /**
   * Verificar se existe ficha com número sequencial
   */
  existeNumeroSequencial(numero: number, orgId: string): Promise<boolean>;

  /**
   * Contar fichas por status
   */
  contarPorStatus(orgId: string, status: string): Promise<number>;
}
