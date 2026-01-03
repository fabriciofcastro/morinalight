/**
 * Sentry Utilities
 * Funções compartilhadas para limpeza de dados e normalização
 */
/**
 * Remove dados sensíveis de objetos antes de enviar para o Sentry
 * Útil para LGPD compliance
 */
export declare function scrubSensitiveData(event: any): any;
/**
 * Normaliza erros para garantir que sempre sejam objetos Error válidos
 */
export declare function normalizeError(error: any): Error;
