/**
 * Sistema de Tratamento de Erros - Frontend
 * 
 * Exportações principais do sistema de tratamento de erros.
 */

// Tipos
export {
  type ApiErrorResponse,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  AppError,
} from "./types";

// Parser
export {
  parseError,
  parseAxiosError,
  isRetryableError,
  getRetryDelay,
} from "./error-parser";

// Error Boundary
export { ErrorBoundary, withErrorBoundary } from "./error-boundary";

// Hooks
export {
  useErrorHandler,
  useAsyncError,
  useErrorTracking,
} from "./hooks";

// Mensagens amigáveis
export {
  getUserFriendlyMessage,
  getShortMessage,
  getErrorTitle,
} from "./user-messages";

