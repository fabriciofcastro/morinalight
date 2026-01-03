import { FichaCustoId } from "../value-objects/ficha-custo-id";
import { type StatusFichaCusto, StatusFichaCustoVO } from "../value-objects/status-ficha-custo";
import { ValorMonetario } from "../value-objects/valor-monetario";
import { Boleto, type BoletoProps } from "./boleto";
import { Insumo, type InsumoProps } from "./insumo";

export type FichaCustoProps = {
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  nomePeca: string;
  categoria?: string | null;
  departmentId?: string | null;
  sectorId?: string | null;
  status: StatusFichaCusto;
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  totalCustos: number;
  custoFinalPeca: number;
  criadoPor: string;
  aprovadoPor?: string | null;
  reprovadoPor?: string | null;
  responsavelFinanceiro?: string | null;
  dataEnvioConferencia?: Date | null;
  dataAprovacao?: Date | null;
  dataReprovacao?: Date | null;
  justificativaReprovacao?: string | null;
  versaoAtual: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Ficha de Custo de Aviamentos - Aggregate Root
 *
 * Representa uma ficha completa de cálculo de custo da peça piloto.
 * Esta é a entidade principal do agregado, controlando todas as regras de negócio.
 */
export class FichaCusto {
  private statusVO: StatusFichaCustoVO;
  private insumos: Insumo[] = [];
  private boletos: Boleto[] = [];
  private totalCustosVO: ValorMonetario;
  private custoFinalPecaVO: ValorMonetario;

  constructor(
    private readonly props: FichaCustoProps,
    private readonly id: FichaCustoId = FichaCustoId.from(),
  ) {
    // Validações obrigatórias
    if (!props.orgId) {
      throw new Error("Ficha de Custo requer orgId");
    }

    if (!props.referenciaPeca || props.referenciaPeca.trim().length === 0) {
      throw new Error("Referência da peça é obrigatória");
    }

    if (!props.nomePeca || props.nomePeca.trim().length === 0) {
      throw new Error("Nome da peça é obrigatória");
    }

    if (!props.criadoPor) {
      throw new Error("Criador é obrigatório");
    }

    if (props.numeroSequencial <= 0) {
      throw new Error("Número sequencial deve ser maior que zero");
    }

    // Inicializar Value Objects
    this.statusVO = StatusFichaCustoVO.criar(props.status);
    this.totalCustosVO = ValorMonetario.criar(props.totalCustos);
    this.custoFinalPecaVO = ValorMonetario.criar(props.custoFinalPeca);
  }

  static criar(
    input: Omit<
      FichaCustoProps,
      | "createdAt"
      | "updatedAt"
      | "status"
      | "totalCustos"
      | "custoFinalPeca"
      | "versaoAtual"
      | "createdBy"
      | "updatedBy"
    > & {
      numeroSequencial: number;
      criadoPor: string;
    },
  ): FichaCusto {
    const agora = new Date();

    return new FichaCusto(
      {
        ...input,
        status: "rascunho",
        totalCustos: 0,
        custoFinalPeca: 0,
        versaoAtual: 1,
        createdBy: input.criadoPor,
        updatedBy: input.criadoPor,
        createdAt: agora,
        updatedAt: agora,
      },
      FichaCustoId.from(),
    );
  }

  static restaurar(props: FichaCustoProps, id: string): FichaCusto {
    const ficha = new FichaCusto({ ...props }, FichaCustoId.from(id));
    return ficha;
  }

  get fichaCustoId(): string {
    return this.id.toString();
  }

  get dados(): FichaCustoProps {
    return { ...this.props };
  }

  get status(): StatusFichaCustoVO {
    return this.statusVO;
  }

  get numeroSequencial(): number {
    return this.props.numeroSequencial;
  }

  get referenciaPeca(): string {
    return this.props.referenciaPeca;
  }

  get nomePeca(): string {
    return this.props.nomePeca;
  }

  get totalCustos(): ValorMonetario {
    return this.totalCustosVO;
  }

  get custoFinalPeca(): ValorMonetario {
    return this.custoFinalPecaVO;
  }

  get insumosList(): Insumo[] {
    return [...this.insumos];
  }

  /**
   * Adicionar insumo à ficha
   */
  adicionarInsumo(insumo: Insumo, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível adicionar insumos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    this.insumos.push(insumo);
    this.recalcularTotais();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Remover insumo da ficha
   */
  removerInsumo(index: number, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(`Não é possível remover insumos. Status atual: ${this.statusVO.formatar()}`);
    }

    if (index < 0 || index >= this.insumos.length) {
      throw new Error("Índice de insumo inválido");
    }

    this.insumos.splice(index, 1);
    this.recalcularTotais();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Atualizar insumo específico
   */
  atualizarInsumo(index: number, insumoAtualizado: Insumo, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(
        `Não é possível atualizar insumos. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    if (index < 0 || index >= this.insumos.length) {
      throw new Error("Índice de insumo inválido");
    }

    this.insumos[index] = insumoAtualizado;
    this.recalcularTotais();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Recalcular totais baseado nos insumos
   */
  private recalcularTotais(): void {
    const total = this.insumos.reduce((soma, insumo) => {
      return soma.somar(insumo.custoTotal);
    }, ValorMonetario.zero());

    this.totalCustosVO = total;
    this.custoFinalPecaVO = total; // Custo final = total de custos (pode ter regras adicionais)
    this.props.totalCustos = total.valorNumerico;
    this.props.custoFinalPeca = total.valorNumerico;
  }

  /**
   * Atualizar dados básicos da ficha
   */
  atualizarDadosBasicos(
    dados: Partial<{
      referenciaPeca: string;
      nomePeca: string;
      categoria: string | null;
      fotoPecaUrl: string | null;
      fotoPecaStorageKey: string | null;
    }>,
    actorId: string,
  ): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(`Não é possível editar ficha. Status atual: ${this.statusVO.formatar()}`);
    }

    if (dados.referenciaPeca !== undefined) {
      if (!dados.referenciaPeca || dados.referenciaPeca.trim().length === 0) {
        throw new Error("Referência da peça não pode ser vazia");
      }
      this.props.referenciaPeca = dados.referenciaPeca;
    }

    if (dados.nomePeca !== undefined) {
      if (!dados.nomePeca || dados.nomePeca.trim().length === 0) {
        throw new Error("Nome da peça não pode ser vazio");
      }
      this.props.nomePeca = dados.nomePeca;
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

    this.marcarComoAtualizado(actorId);
  }

  /**
   * Validar se pode ser enviada para conferência
   */
  validarParaEnvio(): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Foto obrigatória
    if (!this.props.fotoPecaUrl && !this.props.fotoPecaStorageKey) {
      erros.push("Foto da peça é obrigatória");
    }

    // Deve ter pelo menos um insumo
    if (this.insumos.length === 0) {
      erros.push("Ficha deve ter pelo menos um insumo");
    }

    // Todos os insumos devem ter nota fiscal
    this.insumos.forEach((insumo, index) => {
      if (!insumo.validarNotaFiscalObrigatoria()) {
        erros.push(`Insumo ${index + 1} (${insumo.descricao}): Nota fiscal é obrigatória`);
      }
    });

    // Totais devem ser maiores que zero
    if (this.totalCustosVO.igualA(ValorMonetario.zero())) {
      erros.push("Total de custos deve ser maior que zero");
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  /**
   * Enviar para conferência (aprovação)
   */
  enviarParaConferencia(actorId: string): void {
    if (!this.statusVO.podeEnviarParaConferencia()) {
      throw new Error(
        `Ficha não pode ser enviada para conferência. Status atual: ${this.statusVO.formatar()}`,
      );
    }

    const validacao = this.validarParaEnvio();
    if (!validacao.valido) {
      throw new Error(`Ficha não pode ser enviada para conferência: ${validacao.erros.join(", ")}`);
    }

    this.statusVO = StatusFichaCustoVO.enviadaParaConferencia();
    this.props.status = "enviada_para_conferencia";
    this.props.dataEnvioConferencia = new Date();
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Aprovar ficha
   */
  aprovar(aprovadorId: string, actorId: string): void {
    if (!this.statusVO.podeAprovar()) {
      throw new Error(`Ficha não pode ser aprovada. Status atual: ${this.statusVO.formatar()}`);
    }

    this.statusVO = StatusFichaCustoVO.aprovada();
    this.props.status = "aprovada";
    this.props.aprovadoPor = aprovadorId;
    this.props.dataAprovacao = new Date();
    this.props.dataEnvioConferencia = null;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Reprovar ficha
   */
  reprovar(reprovadorId: string, justificativa: string, actorId: string): void {
    if (!this.statusVO.podeReprovar()) {
      throw new Error(`Ficha não pode ser reprovada. Status atual: ${this.statusVO.formatar()}`);
    }

    if (!justificativa || justificativa.trim().length === 0) {
      throw new Error("Justificativa de reprovação é obrigatória");
    }

    this.statusVO = StatusFichaCustoVO.reprovada();
    this.props.status = "reprovada";
    this.props.reprovadoPor = reprovadorId;
    this.props.justificativaReprovacao = justificativa;
    this.props.dataReprovacao = new Date();
    this.props.dataEnvioConferencia = null;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Vincular responsável financeiro
   */
  vincularResponsavelFinanceiro(responsavelId: string, actorId: string): void {
    if (!this.statusVO.isAprovada()) {
      throw new Error("Apenas fichas aprovadas podem ter responsável financeiro vinculado");
    }

    this.props.responsavelFinanceiro = responsavelId;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Atualizar foto da peça
   */
  atualizarFoto(url: string | null, storageKey: string | null, actorId: string): void {
    if (!this.statusVO.isEditavel()) {
      throw new Error(`Não é possível atualizar foto. Status atual: ${this.statusVO.formatar()}`);
    }

    this.props.fotoPecaUrl = url;
    this.props.fotoPecaStorageKey = storageKey;
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Criar nova versão da ficha (versionamento)
   */
  criarNovaVersao(actorId: string, _motivoAlteracao?: string): number {
    this.props.versaoAtual += 1;
    this.marcarComoAtualizado(actorId);
    return this.props.versaoAtual;
  }

  /**
   * Validar se pode anexar boleto
   */
  podeAnexarBoleto(): boolean {
    return this.statusVO.podeAnexarBoleto();
  }

  /**
   * Validar valor do boleto não excede valor aprovado
   */
  validarValorBoleto(valorBoleto: ValorMonetario): boolean {
    if (!this.statusVO.isAprovada()) {
      return false;
    }

    // Valor do boleto não pode exceder o custo final aprovado
    return !valorBoleto.maiorQue(this.custoFinalPecaVO);
  }

  /**
   * Marcar como atualizado
   */
  private marcarComoAtualizado(actorId: string): void {
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  /**
   * Restaurar insumos (usado quando recuperando do banco)
   */
  restaurarInsumos(insumosProps: InsumoProps[]): void {
    this.insumos = insumosProps.map((props) => Insumo.criar(props));
    this.recalcularTotais();
  }

  /**
   * Restaurar boletos (usado quando recuperando do banco)
   */
  restaurarBoletos(boletosProps: Array<BoletoProps & { id: string }>): void {
    this.boletos = boletosProps.map((props) => {
      const { id, ...boletoProps } = props;
      return Boleto.restaurar(boletoProps, id);
    });
  }

  /**
   * Getter para lista de boletos
   */
  get boletosList(): Boleto[] {
    return [...this.boletos];
  }

  /**
   * Anexar boleto à ficha
   */
  anexarBoleto(boleto: Boleto, actorId: string): void {
    if (!this.podeAnexarBoleto()) {
      throw new Error("Boleto só pode ser anexado a ficha aprovada");
    }

    // Validar que o boleto pertence a esta ficha
    if (boleto.dados.fichaCustoId !== this.fichaCustoId) {
      throw new Error("Boleto não pertence a esta ficha de custo");
    }

    // Validar valor do boleto
    if (!this.validarValorBoleto(boleto.valorBoleto)) {
      throw new Error("Valor do boleto excede o custo final aprovado");
    }

    this.boletos.push(boleto);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Buscar boleto por ID
   */
  buscarBoletoPorId(boletoId: string): Boleto | undefined {
    return this.boletos.find((boleto) => boleto.boletoId === boletoId);
  }

  /**
   * Pagar boleto
   */
  pagarBoleto(boletoId: string, actorId: string, dataPagamento?: Date): void {
    const boleto = this.buscarBoletoPorId(boletoId);
    if (!boleto) {
      throw new Error("Boleto não encontrado na ficha");
    }

    if (!boleto.status.podePagar()) {
      throw new Error(`Boleto não pode ser pago no status atual: ${boleto.status.valor}`);
    }

    boleto.marcarComoPago(actorId, dataPagamento);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Remover boleto da ficha
   */
  removerBoleto(boletoId: string, actorId: string): void {
    const boleto = this.buscarBoletoPorId(boletoId);
    if (!boleto) {
      throw new Error("Boleto não encontrado na ficha");
    }

    // Validar que boleto pode ser removido (apenas se pendente)
    if (!boleto.status.isPendente()) {
      throw new Error("Apenas boletos pendentes podem ser removidos");
    }

    const index = this.boletos.findIndex((b) => b.boletoId === boletoId);
    if (index === -1) {
      throw new Error("Boleto não encontrado na ficha");
    }

    this.boletos.splice(index, 1);
    this.marcarComoAtualizado(actorId);
  }

  /**
   * Exportar dados para serialização
   */
  toJSON() {
    return {
      id: this.fichaCustoId,
      ...this.props,
      status: this.props.status,
      totalCustos: this.totalCustosVO.valorNumerico,
      custoFinalPeca: this.custoFinalPecaVO.valorNumerico,
      insumos: this.insumos.map((insumo) => insumo.toJSON()),
      boletos: this.boletos.map((boleto) => boleto.toJSON()),
    };
  }
}
