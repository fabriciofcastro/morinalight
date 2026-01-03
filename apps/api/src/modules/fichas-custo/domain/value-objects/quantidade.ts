/**
 * Value Object para quantidades com unidade de medida
 */
export class Quantidade {
  private constructor(
    private readonly valor: number,
    private readonly unidade: string,
  ) {
    if (valor < 0) {
      throw new Error("Quantidade não pode ser negativa");
    }

    if (!Number.isFinite(valor)) {
      throw new Error("Quantidade deve ser um número finito");
    }

    if (!unidade || unidade.trim().length === 0) {
      throw new Error("Unidade de medida é obrigatória");
    }

    // Validar unidade de medida comum
    const unidadesValidas = [
      "UN",
      "KG",
      "G",
      "M",
      "CM",
      "L",
      "ML",
      "M2",
      "M3",
      "CX",
      "PC",
      "ROL",
      "MT",
    ];

    if (!unidadesValidas.includes(unidade.toUpperCase())) {
      // Permitir outras unidades, mas registrar warning
      console.warn(`Unidade de medida não padrão: ${unidade}`);
    }
  }

  static criar(valor: number, unidade: string): Quantidade {
    return new Quantidade(valor, unidade.toUpperCase());
  }

  static zero(unidade: string): Quantidade {
    return new Quantidade(0, unidade.toUpperCase());
  }

  get valorNumerico(): number {
    return this.valor;
  }

  get unidadeMedida(): string {
    return this.unidade;
  }

  somar(outro: Quantidade): Quantidade {
    if (this.unidade !== outro.unidade) {
      throw new Error(
        `Não é possível somar quantidades de unidades diferentes: ${this.unidade} e ${outro.unidade}`,
      );
    }
    return new Quantidade(this.valor + outro.valor, this.unidade);
  }

  subtrair(outro: Quantidade): Quantidade {
    if (this.unidade !== outro.unidade) {
      throw new Error(
        `Não é possível subtrair quantidades de unidades diferentes: ${this.unidade} e ${outro.unidade}`,
      );
    }
    const resultado = this.valor - outro.valor;
    if (resultado < 0) {
      throw new Error("Resultado da subtração não pode ser negativo");
    }
    return new Quantidade(resultado, this.unidade);
  }

  multiplicar(multiplicador: number): Quantidade {
    if (multiplicador < 0) {
      throw new Error("Multiplicador não pode ser negativo");
    }
    return new Quantidade(this.valor * multiplicador, this.unidade);
  }

  dividir(divisor: number): Quantidade {
    if (divisor === 0) {
      throw new Error("Divisor não pode ser zero");
    }
    return new Quantidade(this.valor / divisor, this.unidade);
  }

  comparar(outro: Quantidade): number {
    if (this.unidade !== outro.unidade) {
      throw new Error(
        `Não é possível comparar quantidades de unidades diferentes: ${this.unidade} e ${outro.unidade}`,
      );
    }
    if (this.valor < outro.valor) return -1;
    if (this.valor > outro.valor) return 1;
    return 0;
  }

  maiorQue(outro: Quantidade): boolean {
    return this.comparar(outro) > 0;
  }

  menorQue(outro: Quantidade): boolean {
    return this.comparar(outro) < 0;
  }

  igualA(outro: Quantidade): boolean {
    return this.comparar(outro) === 0;
  }

  formatar(): string {
    return `${this.valor.toFixed(4)} ${this.unidade}`;
  }

  equals(other: Quantidade): boolean {
    return this.valor === other.valor && this.unidade === other.unidade;
  }
}
