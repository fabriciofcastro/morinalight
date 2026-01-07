import { ValidationError } from '../errors';

/**
 * Email Value Object
 * 
 * Representa um endereço de email válido.
 * Imutável e auto-validado.
 * 
 * Regras:
 * - Formato válido de email
 * - Case-insensitive (normalizado para lowercase)
 * - Não pode ser vazio
 */

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  /**
   * Factory method para criar Email
   * Valida formato antes de criar instância
   */
  static create(email: string): Email {
    if (!email || email.trim().length === 0) {
      throw new ValidationError('Email cannot be empty', 'email', email);
    }

    if (!this.isValid(email)) {
      throw new ValidationError('Invalid email format', 'email', email);
    }

    return new Email(email);
  }

  /**
   * Valida formato de email
   */
  private static isValid(email: string): boolean {
    // RFC 5322 compliant regex (simplificado)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Retorna valor do email
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Retorna domínio do email
   */
  getDomain(): string {
    return this.value.split('@')[1] || '';
  }

  /**
   * Retorna username (parte antes do @)
   */
  getUsername(): string {
    return this.value.split('@')[0] || '';
  }

  /**
   * Compara igualdade com outro Email
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Representação em string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Serialização JSON
   */
  toJSON(): string {
    return this.value;
  }
}
