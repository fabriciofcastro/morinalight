import { ValidationError } from '../errors';

/**
 * CPF Value Object
 * 
 * Representa um CPF brasileiro válido.
 * Imutável e auto-validado.
 * 
 * Regras:
 * - 11 dígitos numéricos
 * - Validação de dígitos verificadores
 * - Não aceita CPFs conhecidos como inválidos (111.111.111-11, etc.)
 */

export class CPF {
  private readonly value: string;

  private constructor(cpf: string) {
    this.value = cpf;
  }

  /**
   * Factory method para criar CPF
   */
  static create(cpf: string): CPF {
    const cleaned = this.clean(cpf);

    if (!this.isValid(cleaned)) {
      throw new ValidationError('Invalid CPF', 'cpf', cpf);
    }

    return new CPF(cleaned);
  }

  /**
   * Remove caracteres não numéricos
   */
  private static clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Valida CPF
   */
  private static isValid(cpf: string): boolean {
    // Deve ter 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Rejeita CPFs conhecidos como inválidos
    const invalidCPFs = [
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
    ];

    if (invalidCPFs.includes(cpf)) {
      return false;
    }

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    if (digit1 !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return digit2 === parseInt(cpf.charAt(10));
  }

  /**
   * Retorna CPF sem formatação
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Retorna CPF formatado (XXX.XXX.XXX-XX)
   */
  getFormatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Compara igualdade
   */
  equals(other: CPF): boolean {
    return this.value === other.value;
  }

  /**
   * Representação em string
   */
  toString(): string {
    return this.getFormatted();
  }

  /**
   * Serialização JSON
   */
  toJSON(): string {
    return this.value;
  }
}
