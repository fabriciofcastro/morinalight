/**
 * Entity: Insumo Técnico da Pré-Ficha Técnica
 * Representa um insumo técnico (não financeiro) utilizado no molde
 */
export type TipoInsumoTecnico = "linha" | "ziper" | "botao" | "etiqueta" | "outros";
export type UnidadeMedida = "cm" | "unidade" | "metro" | "kg" | "litro";

export type ConsumoPorTamanho = {
  [tamanho: string]: number; // Ex: { "PP": 10, "P": 12, "M": 14, "G": 16, "GG": 18 }
};

export type InsumoTecnicoProps = {
  descricao: string;
  tipo: TipoInsumoTecnico;
  quantidadeBase: number; // Ex: 1x, 2x
  consumoPorTamanho?: ConsumoPorTamanho | null;
  unidadeMedida: UnidadeMedida;
  observacoesTecnicas?: string | null;
  ordem?: number;
};

export class InsumoTecnico {
  constructor(private readonly props: InsumoTecnicoProps) {
    this.validar();
  }

  private validar(): void {
    if (!this.props.descricao || this.props.descricao.trim().length === 0) {
      throw new Error("Descrição do insumo técnico é obrigatória");
    }

    if (this.props.quantidadeBase <= 0) {
      throw new Error("Quantidade base do insumo deve ser maior que zero");
    }

    if (!this.props.unidadeMedida) {
      throw new Error("Unidade de medida é obrigatória");
    }

    if (this.props.descricao.length > 500) {
      throw new Error("Descrição do insumo não pode exceder 500 caracteres");
    }
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get tipo(): TipoInsumoTecnico {
    return this.props.tipo;
  }

  get quantidadeBase(): number {
    return this.props.quantidadeBase;
  }

  get consumoPorTamanho(): ConsumoPorTamanho | null | undefined {
    return this.props.consumoPorTamanho;
  }

  get unidadeMedida(): UnidadeMedida {
    return this.props.unidadeMedida;
  }

  get observacoesTecnicas(): string | null | undefined {
    return this.props.observacoesTecnicas;
  }

  get ordem(): number {
    return this.props.ordem ?? 0;
  }

  toJSON(): InsumoTecnicoProps {
    return {
      ...this.props,
      ordem: this.ordem,
    };
  }

  static criar(props: InsumoTecnicoProps): InsumoTecnico {
    return new InsumoTecnico(props);
  }
}

