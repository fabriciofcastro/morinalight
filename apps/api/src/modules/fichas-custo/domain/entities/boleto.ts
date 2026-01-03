import { BoletoId } from "../value-objects/boleto-id";
import { type StatusBoleto, StatusBoletoVO } from "../value-objects/status-boleto";
import { ValorMonetario } from "../value-objects/valor-monetario";

export type BoletoProps = {
  fichaCustoId: string;
  insumoId?: string | null;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  arquivoUrl?: string | null;
  arquivoStorageKey?: string | null;
  valorBoleto: number;
  dataVencimento: Date;
  codigoBarras?: string | null;
  linhaDigitavel?: string | null;
  status: StatusBoleto;
  dataPagamento?: Date | null;
  observacoes?: string | null;
  anexadoPor: string;
  pagoPor?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Entity Boleto - Representa um boleto anexado a uma ficha de custo
 */
export class Boleto {
  private valorBoletoVO: ValorMonetario;
  private statusVO: StatusBoletoVO;

  constructor(
    private readonly props: BoletoProps,
    private readonly id: BoletoId = BoletoId.from(),
  ) {
    // Validações obrigatórias
    if (!props.fichaCustoId) {
      throw new Error("Ficha de custo é obrigatória");
    }

    if (!props.valorBoleto || props.valorBoleto <= 0) {
      throw new Error("Valor do boleto deve ser maior que zero");
    }

    if (!props.dataVencimento) {
      throw new Error("Data de vencimento é obrigatória");
    }

    if (!props.anexadoPor) {
      throw new Error("Usuário que anexou o boleto é obrigatório");
    }

    // Criar Value Objects
    this.valorBoletoVO = ValorMonetario.criar(props.valorBoleto);
    this.statusVO = StatusBoletoVO.criar(props.status);
  }

  static criar(
    input: Omit<BoletoProps, "status" | "createdAt" | "updatedAt" | "pagoPor" | "dataPagamento">,
  ): Boleto {
    const agora = new Date();

    return new Boleto({
      ...input,
      status: "pendente",
      dataPagamento: null,
      pagoPor: null,
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: BoletoProps, id: string): Boleto {
    return new Boleto(props, BoletoId.criar(id));
  }

  get boletoId(): string {
    return this.id.valor;
  }

  get dados(): BoletoProps {
    return { ...this.props };
  }

  get fichaCustoId(): string {
    return this.props.fichaCustoId;
  }

  get valorBoleto(): ValorMonetario {
    return this.valorBoletoVO;
  }

  get status(): StatusBoletoVO {
    return this.statusVO;
  }

  get dataVencimento(): Date {
    return this.props.dataVencimento;
  }

  get dataPagamento(): Date | null | undefined {
    return this.props.dataPagamento;
  }

  get fornecedorId(): string | null | undefined {
    return this.props.fornecedorId;
  }

  get fornecedorNome(): string | null | undefined {
    return this.props.fornecedorNome;
  }

  /**
   * Marcar boleto como pago
   */
  marcarComoPago(pagoPor: string, dataPagamento?: Date): void {
    if (!this.statusVO.podePagar()) {
      throw new Error(`Boleto não pode ser pago no status atual: ${this.statusVO.valor}`);
    }

    this.statusVO = StatusBoletoVO.criar("pago");
    this.props.status = "pago";
    this.props.pagoPor = pagoPor;
    this.props.dataPagamento = dataPagamento ?? new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Verificar se boleto está vencido
   */
  verificarVencimento(): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(this.props.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hoje && this.statusVO.isPendente()) {
      this.statusVO = StatusBoletoVO.criar("vencido");
      this.props.status = "vencido";
      this.props.updatedAt = new Date();
      return true;
    }

    return false;
  }

  /**
   * Atualizar valor do boleto (apenas se pendente)
   */
  atualizarValor(novoValor: number, _actorId: string): void {
    if (!this.statusVO.isPendente()) {
      throw new Error("Não é possível alterar valor de boleto pago ou cancelado");
    }

    if (novoValor <= 0) {
      throw new Error("Valor do boleto deve ser maior que zero");
    }

    this.valorBoletoVO = ValorMonetario.criar(novoValor);
    this.props.valorBoleto = novoValor;
    this.props.updatedAt = new Date();
  }

  /**
   * Atualizar data de vencimento (apenas se pendente)
   */
  atualizarDataVencimento(novaData: Date, _actorId: string): void {
    if (!this.statusVO.isPendente()) {
      throw new Error("Não é possível alterar data de vencimento de boleto pago ou cancelado");
    }

    if (!novaData) {
      throw new Error("Data de vencimento é obrigatória");
    }

    this.props.dataVencimento = novaData;
    this.props.updatedAt = new Date();
  }

  /**
   * Atualizar arquivo do boleto
   */
  atualizarArquivo(
    arquivoUrl: string | null,
    arquivoStorageKey: string | null,
    _actorId: string,
  ): void {
    this.props.arquivoUrl = arquivoUrl;
    this.props.arquivoStorageKey = arquivoStorageKey;
    this.props.updatedAt = new Date();
  }

  /**
   * Atualizar observações
   */
  atualizarObservacoes(observacoes: string | null, _actorId: string): void {
    this.props.observacoes = observacoes;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.boletoId,
      fichaCustoId: this.props.fichaCustoId,
      insumoId: this.props.insumoId,
      fornecedorId: this.props.fornecedorId,
      fornecedorNome: this.props.fornecedorNome,
      arquivoUrl: this.props.arquivoUrl,
      arquivoStorageKey: this.props.arquivoStorageKey,
      valorBoleto: this.valorBoletoVO.valorNumerico,
      dataVencimento: this.props.dataVencimento.toISOString(),
      codigoBarras: this.props.codigoBarras,
      linhaDigitavel: this.props.linhaDigitavel,
      status: this.statusVO.valor,
      dataPagamento: this.props.dataPagamento?.toISOString() ?? null,
      observacoes: this.props.observacoes,
      anexadoPor: this.props.anexadoPor,
      pagoPor: this.props.pagoPor,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}











