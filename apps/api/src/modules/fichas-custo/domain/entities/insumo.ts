import { Quantidade } from "../value-objects/quantidade";
import { ValorMonetario } from "../value-objects/valor-monetario";

export type TipoInsumo = "aviamento" | "servico" | "terceirizacao" | "outros";

export type InsumoProps = {
  descricao: string;
  tipo: TipoInsumo;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  fornecedorCnpj?: string | null;
  notaFiscalNumero?: string | null;
  notaFiscalData?: Date | null;
  notaFiscalValor?: number | null;
  quantidade: number;
  unidadeMedida: string;
  custoUnitario: number;
  observacoes?: string | null;
};

export class Insumo {
  private quantidadeVO: Quantidade;
  private custoUnitarioVO: ValorMonetario;
  private custoTotalVO: ValorMonetario;

  constructor(private readonly props: InsumoProps) {
    // Validar descrição
    if (!props.descricao || props.descricao.trim().length === 0) {
      throw new Error("Descrição do insumo é obrigatória");
    }

    // Validar quantidade
    if (props.quantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    // Validar custo unitário
    if (props.custoUnitario < 0) {
      throw new Error("Custo unitário não pode ser negativo");
    }

    // Criar Value Objects
    this.quantidadeVO = Quantidade.criar(props.quantidade, props.unidadeMedida);
    this.custoUnitarioVO = ValorMonetario.criar(props.custoUnitario);

    // Calcular custo total
    this.custoTotalVO = this.custoUnitarioVO.multiplicar(props.quantidade);
  }

  static criar(input: InsumoProps): Insumo {
    return new Insumo(input);
  }

  get dados(): InsumoProps {
    return { ...this.props };
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get tipo(): TipoInsumo {
    return this.props.tipo;
  }

  get quantidade(): Quantidade {
    return this.quantidadeVO;
  }

  get custoUnitario(): ValorMonetario {
    return this.custoUnitarioVO;
  }

  get custoTotal(): ValorMonetario {
    return this.custoTotalVO;
  }

  get fornecedorId(): string | null | undefined {
    return this.props.fornecedorId;
  }

  get fornecedorNome(): string | null | undefined {
    return this.props.fornecedorNome;
  }

  get notaFiscalNumero(): string | null | undefined {
    return this.props.notaFiscalNumero;
  }

  atualizarQuantidade(novaQuantidade: number, _actorId: string): void {
    if (novaQuantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    this.quantidadeVO = Quantidade.criar(novaQuantidade, this.props.unidadeMedida);
    this.props.quantidade = novaQuantidade;

    // Recalcular custo total
    this.custoTotalVO = this.custoUnitarioVO.multiplicar(novaQuantidade);
  }

  atualizarCustoUnitario(novoCusto: number, _actorId: string): void {
    if (novoCusto < 0) {
      throw new Error("Custo unitário não pode ser negativo");
    }

    this.custoUnitarioVO = ValorMonetario.criar(novoCusto);
    this.props.custoUnitario = novoCusto;

    // Recalcular custo total
    this.custoTotalVO = this.custoUnitarioVO.multiplicar(this.props.quantidade);
  }

  atualizarNotaFiscal(
    numero: string | null,
    data: Date | null,
    valor: number | null,
    _actorId: string,
  ): void {
    this.props.notaFiscalNumero = numero;
    this.props.notaFiscalData = data;
    this.props.notaFiscalValor = valor;
  }

  atualizarObservacoes(observacoes: string | null, _actorId: string): void {
    this.props.observacoes = observacoes;
  }

  atualizarFornecedor(
    fornecedorId: string | null,
    fornecedorNome: string | null,
    fornecedorCnpj: string | null,
    _actorId: string,
  ): void {
    this.props.fornecedorId = fornecedorId;
    this.props.fornecedorNome = fornecedorNome;
    this.props.fornecedorCnpj = fornecedorCnpj;
  }

  validarNotaFiscalObrigatoria(): boolean {
    // Regra de negócio: nota fiscal é obrigatória para cada insumo
    return !!this.props.notaFiscalNumero && !!this.props.notaFiscalData;
  }

  toJSON() {
    return {
      descricao: this.props.descricao,
      tipo: this.props.tipo,
      fornecedorId: this.props.fornecedorId,
      fornecedorNome: this.props.fornecedorNome,
      fornecedorCnpj: this.props.fornecedorCnpj,
      notaFiscalNumero: this.props.notaFiscalNumero,
      notaFiscalData: this.props.notaFiscalData,
      notaFiscalValor: this.props.notaFiscalValor,
      quantidade: this.props.quantidade,
      unidadeMedida: this.props.unidadeMedida,
      custoUnitario: this.props.custoUnitario,
      custoTotal: this.custoTotalVO.valorNumerico,
      observacoes: this.props.observacoes,
    };
  }
}
