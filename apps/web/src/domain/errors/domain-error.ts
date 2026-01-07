/**
 * Base Domain Error
 * 
 * Erro abstrato base para todos os erros de domínio.
 * Segue Clean Architecture: erros de domínio não dependem de nada externo.
 */

export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly timestamp: Date = new Date()
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Mantém stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
