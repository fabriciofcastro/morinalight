import { DomainError } from './domain-error';

/**
 * Business Rule Error
 * 
 * Erro lançado quando regras de negócio são violadas.
 */

export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    public readonly rule?: string
  ) {
    super(message, 'BUSINESS_RULE_ERROR');
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      rule: this.rule,
    };
  }
}
