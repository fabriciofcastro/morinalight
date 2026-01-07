import { ValidationError } from '../errors';

/**
 * Money Value Object
 * 
 * Representa valores monetários com validação e operações.
 */
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new ValidationError(
        'Amount cannot be negative',
        'amount',
        amount
      );
    }

    if (!currency || currency.trim().length === 0) {
      throw new ValidationError(
        'Currency is required',
        'currency'
      );
    }

    const validCurrencies = ['BRL', 'USD', 'EUR'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new ValidationError(
        `Invalid currency. Must be one of: ${validCurrencies.join(', ')}`,
        'currency',
        currency
      );
    }

    return new Money(amount, currency.toUpperCase());
  }

  getValue(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        'Cannot add money with different currencies',
        'currency'
      );
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        'Cannot subtract money with different currencies',
        'currency'
      );
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new ValidationError(
        'Result cannot be negative',
        'amount'
      );
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new ValidationError(
        'Factor cannot be negative',
        'factor',
        factor
      );
    }
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new ValidationError(
        'Divisor must be greater than zero',
        'divisor',
        divisor
      );
    }
    return new Money(this.amount / divisor, this.currency);
  }

  percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        'Cannot compare money with different currencies',
        'currency'
      );
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        'Cannot compare money with different currencies',
        'currency'
      );
    }
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
