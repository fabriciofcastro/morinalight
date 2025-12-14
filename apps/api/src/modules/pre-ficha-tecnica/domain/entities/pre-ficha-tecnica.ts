import { PreFichaTecnicaId } from "../value-objects/pre-ficha-tecnica-id";
import { StatusPreFichaTecnicaVO, StatusPreFichaTecnica } from "../value-objects/status-pre-ficha-tecnica";
import { Tecido, TecidoProps } from "./tecido";
import { InsumoTecnico, InsumoTecnicoProps } from "./insumo-tecnico";

export type PreFichaTecnicaProps = {
  orgId: string;
  numeroSequencial: number;
  codigoPeca: string;
  nomePecaPiloto: string;
  categoria?: string | null;
  versaoMolde: number;
  status: StatusPreFichaTecnica;
  
  // Evidências Visuais
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  fotosAdicionais?: string[] | null;
  
  // Responsáveis Técnicos
  estilistaId?: string | null;
  estilistaNome?: string | null;
  modelistaId?: string | null;
  modelistaNome?: string | null;
  piloteiroId?: string | null;
  piloteiroNome?: string | null;
  liberadoPorId?: string | null;
  liberadoPorNome?: string | null;
  
  // Grade de Tamanhos
  gradeTamanhos?: string[] | null;
  
  // Observações
  observacoesTecnicas?: string | null;
  observacoesOficina?: string | null;
  
  // Alteração Técnica
  houveAlteracao: boolean;
  descricaoAlteracao?: string | null;
  
  // Checklist Técnico
  checklistTecnico?: {
    moldeVesteCorretamente?: boolean;
    costuraViavel?: boolean;
    insumosCompatíveis?: boolean;
    pecaPilotoAprovadaVisualmente?: boolean;
  } | null;
  
  // Medidas Críticas
  medidasCriticas?: string | null;
  
  // Conclusão da Avaliação
  resultadoAvaliacao?: string | null;
  observacaoAvaliacao?: string | null;
  
  // Datas importantes
  dataSubmissao?: Date | null;
  dataInicioRevisao?: Date | null;
  dataAprovacaoTecnica?: Date | null;
  dataAprovacaoDiretoria?: Date | null;
  dataReprovacao?: Date | null;
  justificativaReprovacao?: string | null;
  
  // Versionamento
  versaoAtual: number;
  versaoAnteriorId?: string | null;
  
  // Auditoria
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Pré-Ficha Técnica - Aggregate Root
 * 
 * Representa a análise técnica de um molde aplicado à peça piloto.
 * Esta é a entidade principal do agregado, controlando todas as regras de negócio.
 */
export class PreFichaTecnica {
  private statusVO: StatusPreFichaTecnicaVO;
  private tecidos: Tecido[] = [];
  private insumosTecnicos: InsumoTecnico[] = [];

  constructor(
    private readonly props: PreFichaTecnicaProps,
    private readonly id: PreFichaTecnicaId = PreFichaTecnicaId.from(),
  ) {
    // Validações obrigatórias
    if (!props.orgId) {
      throw new Error("Pré-Ficha Técnica requer orgId");
    }

    if (!props.codigoPeca || props.codigoPeca.trim().length === 0) {
      throw new Error("Código da peça é obrigatório");
    }

    if (!props.nomePecaPiloto || props.nomePecaPiloto.trim().length === 0) {
      throw new Error("Nome da peça piloto é obrigatório");
    }

    if (props.numeroSequencial <= 0) {
      throw new Error("Número sequencial deve ser maior que zero");
    }

    // Inicializar Value Objects
    this.statusVO = StatusPreFichaTecnicaVO.criar(props.status);
  }

  static criar(
    input: Omit<
      PreFichaTecnicaProps,
      | "createdAt"
      | "updatedAt"
      | "status"
      | "versaoAtual"
      | "houveAlteracao"
      | "createdBy"
      | "updatedBy"
    > & {
      criadoPor: string;
    },
  ): PreFichaTecnica {
    const agora = new Date();

    return new PreFichaTecnica(
      {
        ...input,
        status: "rascunho",
        versaoAtual: 1,
        houveAlteracao: false,
        createdBy: input.criadoPor,
        updatedBy: input.criadoPor,
        createdAt: agora,
        updatedAt: agora,
      },
      PreFichaTecnicaId.from(),
    );
  }

  static restaurar(props: PreFichaTecnicaProps, id: string): PreFichaTecnica {
    const preFicha = new PreFichaTecnica({ ...props }, PreFichaTecnicaId.from(id));
    return preFicha;
  }

  get preFichaTecnicaId(): string {
    return this.id.toString();
  }

  get dados(): PreFichaTecnicaProps {
    return { ...this.props };
  }

  get status(): StatusPreFichaTecnicaVO {
    return this.statusVO;
  }

  get numeroSequencial(): number {
    return this.props.numeroSequencial;
  }

  get codigoPeca(): string {
    return this.props.codigoPeca;
  }

  get nomePecaPiloto(): string {
    return this.props.nomePecaPiloto;
  }

  get tecidosList(): Tecido[] {
    return [...this.tecidos];
  }

  get insumosTecnicosList(): InsumoTecnico[] {
    return [...this.insumosTecnicos];
  }

  /**
   * Adicionar tecido à pré-ficha
   */
  adicionarTecido(tecido: Tecido, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível adicionar tecidos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.tecidos.push(tecido);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Remover tecido da pré-ficha
   */
  removerTecido(index: number, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível remover tecidos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    if (index < 0 || index >= this.tecidos.length) {
      throw new Error("Índice de tecido inválido");
    }

    this.tecidos.splice(index, 1);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Adicionar insumo técnico à pré-ficha
   */
  adicionarInsumoTecnico(insumoTecnico: InsumoTecnico, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível adicionar insumos técnicos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.insumosTecnicos.push(insumoTecnico);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Remover insumo técnico da pré-ficha
   */
  removerInsumoTecnico(index: number, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível remover insumos técnicos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    if (index < 0 || index >= this.insumosTecnicos.length) {
      throw new Error("Índice de insumo técnico inválido");
    }

    this.insumosTecnicos.splice(index, 1);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Atualizar dados básicos da pré-ficha
   */
  atualizarDadosBasicos(
    dados: Partial<{
      codigoPeca: string;
      nomePecaPiloto: string;
      categoria: string | null;
      fotoPecaUrl: string | null;
      fotoPecaStorageKey: string | null;
      observacoesTecnicas: string | null;
      observacoesOficina: string | null;
      gradeTamanhos: string[] | null;
    }>,
    actorId: string,
  ): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível editar pré-ficha. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    if (dados.codigoPeca !== undefined) {
      if (!dados.codigoPeca || dados.codigoPeca.trim().length === 0) {
        throw new Error("Código da peça não pode ser vazio");
      }
      this.props.codigoPeca = dados.codigoPeca;
    }

    if (dados.nomePecaPiloto !== undefined) {
      if (!dados.nomePecaPiloto || dados.nomePecaPiloto.trim().length === 0) {
        throw new Error("Nome da peça piloto não pode ser vazio");
      }
      this.props.nomePecaPiloto = dados.nomePecaPiloto;
    }

    if (dados.categoria !== undefined) {
      this.props.categoria = dados.categoria;
    }

    if (dados.fotoPecaUrl !== undefined) {
      this.props.fotoPecaUrl = dados.fotoPecaUrl;
    }

    if (dados.fotoPecaStorageKey !== undefined) {
      this.props.fotoPecaStorageKey = dados.fotoPecaStorageKey;
    }

    if (dados.observacoesTecnicas !== undefined) {
      this.props.observacoesTecnicas = dados.observacoesTecnicas;
    }

    if (dados.observacoesOficina !== undefined) {
      this.props.observacoesOficina = dados.observacoesOficina;
    }

    if (dados.gradeTamanhos !== undefined) {
      this.props.gradeTamanhos = dados.gradeTamanhos;
    }

    this.marcarComoAtualizado(actorId);
  }

  /**
   * Validar se pode ser submetida para revisão
   */
  podeSerSubmetida(): { valido: boolean; motivo?: string } {
    if (!this.props.fotoPecaUrl && !this.props.fotoPecaStorageKey) {
      return { valido: false, motivo: "Foto da peça piloto é obrigatória" };
    }

    if (this.tecidos.length === 0) {
      return { valido: false, motivo: "Pelo menos um tecido deve ser cadastrado" };
    }

    // Validar se todos os tecidos têm consumo e largura
    for (const tecido of this.tecidos) {
      if (tecido.consumo <= 0 || tecido.largura <= 0) {
        return {
          valido: false,
          motivo: `Tecido "${tecido.nome}" deve ter consumo e largura preenchidos`,
        };
      }
    }

    // Validar insumos técnicos
    for (const insumo of this.insumosTecnicos) {
      if (!insumo.unidadeMedida || insumo.quantidadeBase <= 0) {
        return {
          valido: false,
          motivo: `Insumo "${insumo.descricao}" deve ter unidade de medida e quantidade base preenchidos`,
        };
      }
    }

    return { valido: true };
  }

  /**
   * Submeter para revisão técnica
   */
  submeterParaRevisaoTecnica(actorId: string): void {
    if (!this.statusVO.podeSubmeterParaRevisao()) {
      throw new Error(
        `Não é possível submeter. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    const validacao = this.podeSerSubmetida();
    if (!validacao.valido) {
      throw new Error(validacao.motivo);
    }

    this.statusVO = StatusPreFichaTecnicaVO.submetidaParaRevisaoTecnica();
    this.props.status = "submetida_para_revisao_tecnica";
    this.props.dataSubmissao = new Date();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Iniciar revisão da ficha técnica
   */
  iniciarRevisaoFichaTecnica(actorId: string): void {
    if (!this.statusVO.podeIniciarRevisao()) {
      throw new Error(
        `Não é possível iniciar revisão. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.statusVO = StatusPreFichaTecnicaVO.emRevisaoFichaTecnica();
    this.props.status = "em_revisao_ficha_tecnica";
    this.props.dataInicioRevisao = new Date();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Aprovar tecnicamente
   */
  aprovarTecnicamente(aprovadorId: string, aprovadorNome: string, actorId: string): void {
    if (!this.statusVO.podeAprovarTecnicamente()) {
      throw new Error(
        `Não é possível aprovar tecnicamente. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.statusVO = StatusPreFichaTecnicaVO.aprovadaTecnicamente();
    this.props.status = "aprovada_tecnicamente";
    this.props.dataAprovacaoTecnica = new Date();
    this.props.liberadoPorId = aprovadorId;
    this.props.liberadoPorNome = aprovadorNome;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Enviar para avaliação da diretoria
   */
  enviarParaAvalDiretoria(actorId: string): void {
    if (this.props.status !== "aprovada_tecnicamente") {
      throw new Error(
        `Não é possível enviar para diretoria. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.statusVO = StatusPreFichaTecnicaVO.aguardandoAvalDiretoria();
    this.props.status = "aguardando_aval_diretoria";
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Aprovar pela diretoria (liberar para produção piloto)
   */
  aprovarDiretoria(aprovadorId: string, aprovadorNome: string, actorId: string): void {
    if (!this.statusVO.podeAprovarDiretoria()) {
      throw new Error(
        `Não é possível aprovar pela diretoria. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.statusVO = StatusPreFichaTecnicaVO.liberadaParaProducaoPiloto();
    this.props.status = "liberada_para_producao_piloto";
    this.props.dataAprovacaoDiretoria = new Date();
    this.props.liberadoPorId = aprovadorId;
    this.props.liberadoPorNome = aprovadorNome;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Reprovar
   */
  reprovar(
    reprovadorId: string,
    reprovadorNome: string,
    justificativa: string,
    actorId: string,
  ): void {
    if (!this.statusVO.podeReprovar()) {
      throw new Error(
        `Não é possível reprovar. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    if (!justificativa || justificativa.trim().length < 10) {
      throw new Error("Justificativa deve ter pelo menos 10 caracteres");
    }

    this.statusVO = StatusPreFichaTecnicaVO.reprovada();
    this.props.status = "reprovada";
    this.props.dataReprovacao = new Date();
    this.props.justificativaReprovacao = justificativa;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Atualizar checklist técnico
   */
  atualizarChecklistTecnico(
    checklist: {
      moldeVesteCorretamente?: boolean;
      costuraViavel?: boolean;
      insumosCompatíveis?: boolean;
      pecaPilotoAprovadaVisualmente?: boolean;
    },
    actorId: string,
  ): void {
    if (!this.statusVO.isEmRevisaoFichaTecnica()) {
      throw new Error("Checklist técnico só pode ser atualizado durante a revisão");
    }

    this.props.checklistTecnico = checklist;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Atualizar responsáveis técnicos
   */
  atualizarResponsaveis(
    responsaveis: Partial<{
      estilistaId: string | null;
      estilistaNome: string | null;
      modelistaId: string | null;
      modelistaNome: string | null;
      piloteiroId: string | null;
      piloteiroNome: string | null;
    }>,
    actorId: string,
  ): void {
    if (this.statusVO.isCongelada()) {
      throw new Error(
        "Responsáveis técnicos não podem ser alterados após aprovação técnica",
      );
    }

    if (responsaveis.estilistaId !== undefined) {
      this.props.estilistaId = responsaveis.estilistaId;
    }
    if (responsaveis.estilistaNome !== undefined) {
      this.props.estilistaNome = responsaveis.estilistaNome;
    }
    if (responsaveis.modelistaId !== undefined) {
      this.props.modelistaId = responsaveis.modelistaId;
    }
    if (responsaveis.modelistaNome !== undefined) {
      this.props.modelistaNome = responsaveis.modelistaNome;
    }
    if (responsaveis.piloteiroId !== undefined) {
      this.props.piloteiroId = responsaveis.piloteiroId;
    }
    if (responsaveis.piloteiroNome !== undefined) {
      this.props.piloteiroNome = responsaveis.piloteiroNome;
    }

    this.marcarComoAtualizado(actorId);
  }

  /**
   * Marcar como atualizado
   */
  private marcarComoAtualizado(actorId: string): void {
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  /**
   * Restaurar tecidos (usado pelo repositório)
   */
  restaurarTecidos(tecidosProps: TecidoProps[]): void {
    this.tecidos = [];
    tecidosProps.forEach((props) => {
      this.tecidos.push(Tecido.criar(props));
    });
  }

  /**
   * Restaurar insumos técnicos (usado pelo repositório)
   */
  restaurarInsumosTecnicos(insumosProps: InsumoTecnicoProps[]): void {
    this.insumosTecnicos = [];
    insumosProps.forEach((props) => {
      this.insumosTecnicos.push(InsumoTecnico.criar(props));
    });
  }

  /**
   * Criar nova versão (após alteração)
   */
  criarNovaVersao(): void {
    this.props.versaoAtual += 1;
    this.props.versaoMolde += 1;
  }

    return novaVersao;
  }
}

