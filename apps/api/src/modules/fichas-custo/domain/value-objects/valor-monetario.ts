/**
 * Value Object para valores monetários
 * Garante precisão decimal e validação
 */
export class ValorMonetario {
  private constructor(
    private readonly valor: number,
    private readonly moeda: string = "BRL",
  ) {
    if (valor < 0) {
      throw new Error("Valor monetário não pode ser negativo");
    }

    if (!Number.isFinite(valor)) {
      throw new Error("Valor monetário deve ser um número finito");
    }

    // Arredondar para 2 casas decimais
    this.valor = Math.round(valor * 100) / 100;
  }

  static criar(valor: number, moeda: string = "BRL"): ValorMonetario {
    return new ValorMonetario(valor, moeda);
  }

  static zero(moeda: string = "BRL"): ValorMonetario {
    return new ValorMonetario(0, moeda);
  }

  get valorNumerico(): number {
    return this.valor;
  }

  get codigoMoeda(): string {
    return this.moeda;
  }

  somar(outro: ValorMonetario): ValorMonetario {
    if (this.moeda !== outro.moeda) {
      throw new Error("Não é possível somar valores de moedas diferentes");
    }
    return new ValorMonetario(this.valor + outro.valor, this.moeda);
  }

  subtrair(outro: ValorMonetario): ValorMonetario {
    if (this.moeda !== outro.moeda) {
      throw new Error("Não é possível subtrair valores de moedas diferentes");
    }
    return new ValorMonetario(this.valor - outro.valor, this.moeda);
  }

  multiplicar(multiplicador: number): ValorMonetario {
    if (multiplicador < 0) {
      throw new Error("Multiplicador não pode ser negativo");
    }
    return new ValorMonetario(this.valor * multiplicador, this.moeda);
  }

  dividir(divisor: number): ValorMonetario {
    if (divisor === 0) {
      throw new Error("Divisor não pode ser zero");
    }
    return new ValorMonetario(this.valor / divisor, this.moeda);
  }

  comparar(outro: ValorMonetario): number {
    if (this.moeda !== outro.moeda) {
      throw new Error("Não é possível comparar valores de moedas diferentes");
    }
    if (this.valor < outro.valor) return -1;
    if (this.valor > outro.valor) return 1;
    return 0;
  }

  maiorQue(outro: ValorMonetario): boolean {
    return this.comparar(outro) > 0;
  }

  menorQue(outro: ValorMonetario): boolean {
    return this.comparar(outro) < 0;
  }

  igualA(outro: ValorMonetario): boolean {
    return this.comparar(outro) === 0;
  }

  formatar(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: this.moeda,
    }).format(this.valor);
  }

  equals(other: ValorMonetario): boolean {
    return this.valor === other.valor && this.moeda === other.moeda;
  }
}
