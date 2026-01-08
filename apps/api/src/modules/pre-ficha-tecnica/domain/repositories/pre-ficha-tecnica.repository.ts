import type { PreFichaTecnica, PreFichaTecnicaProps } from "../entities/pre-ficha-tecnica";

export type PreFichaTecnicaFiltro = {
  orgId: string;
  status?: string[];
  categoria?: string;
  codigoPeca?: string;
  criadoPor?: string;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string; // Busca full-text
};

export type PreFichaTecnicaPagina = {
  itens: PreFichaTecnica[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
};

export interface PreFichaTecnicaRepository {
  /**
   * Salvar ou atualizar pré-ficha técnica
   */
  salvar(preFicha: PreFichaTecnica): Promise<void>;

  /**
   * Buscar por ID
   */
  buscarPorId(id: string, orgId: string): Promise<PreFichaTecnica | null>;

  /**
   * Buscar por número sequencial
   */
  buscarPorNumeroSequencial(numero: number, orgId: string): Promise<PreFichaTecnica | null>;

  /**
   * Buscar por código da peça
   */
  buscarPorCodigoPeca(codigo: string, orgId: string): Promise<PreFichaTecnica[]>;

  /**
   * Listar pré-fichas com filtros e paginação
   */
  listar(
    filtro: PreFichaTecnicaFiltro,
    pagina: number,
    tamanhoPagina: number,
  ): Promise<PreFichaTecnicaPagina>;

  /**
   * Obter próximo número sequencial para uma organização
   */
  obterProximoNumeroSequencial(orgId: string): Promise<number>;

  /**
   * Verificar se existe pré-ficha com número sequencial
   */
  existeNumeroSequencial(numero: number, orgId: string): Promise<boolean>;

  /**
   * Contar pré-fichas por status
   */
  contarPorStatus(orgId: string, status: string): Promise<number>;

  /**
   * Criar versão (snapshot) da pré-ficha técnica
   */
  criarVersao(
    preFichaTecnicaId: string,
    orgId: string,
    dados: {
      versao: number;
      criadoPor: string;
      motivoAlteracao?: string | null;
      dadosSnapshot: any;
    },
  ): Promise<void>;
}
