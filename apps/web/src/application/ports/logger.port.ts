/**
 * Logger Port
 * 
 * Interface para logging.
 * Implementação concreta ficará em infrastructure/logger.
 */

export interface ILogger {
  /**
   * Log de informação
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log de erro
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void;

  /**
   * Log de warning
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log de debug
   */
  debug(message: string, context?: Record<string, unknown>): void;
  profile(label: string): () => void;
}
