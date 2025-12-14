/**
 * Entity: Tecido da Pré-Ficha Técnica
 * Representa um tecido utilizado no molde
 */
export type TipoTecido = "principal" | "forro" | "entretela" | "outros";

export type TecidoProps = {
  tipo: TipoTecido;
  nome: string;
  especificacao?: string | null;
  consumo: number; // Obrigatório
  largura: number; // Obrigatório
  quantidadePartes?: number | null;
  observacoesTecnicas?: string | null;
  ordem?: number;
};

export class Tecido {
  constructor(private readonly props: TecidoProps) {
    this.validar();
  }

  private validar(): void {
    if (!this.props.nome || this.props.nome.trim().length === 0) {
      throw new Error("Nome do tecido é obrigatório");
    }

    if (this.props.consumo <= 0) {
      throw new Error("Consumo do tecido deve ser maior que zero");
    }

    if (this.props.largura <= 0) {
      throw new Error("Largura do tecido deve ser maior que zero");
    }

    if (this.props.nome.length > 255) {
      throw new Error("Nome do tecido não pode exceder 255 caracteres");
    }
  }

  get tipo(): TipoTecido {
    return this.props.tipo;
  }

  get nome(): string {
    return this.props.nome;
  }

  get especificacao(): string | null | undefined {
    return this.props.especificacao;
  }

  get consumo(): number {
    return this.props.consumo;
  }

  get largura(): number {
    return this.props.largura;
  }

  get quantidadePartes(): number {
    return this.props.quantidadePartes ?? 1;
  }

  get observacoesTecnicas(): string | null | undefined {
    return this.props.observacoesTecnicas;
  }

  get ordem(): number {
    return this.props.ordem ?? 0;
  }

  toJSON(): TecidoProps {
    return {
      ...this.props,
      ordem: this.ordem,
    };
  }

  static criar(props: TecidoProps): Tecido {
    return new Tecido(props);
  }
}

