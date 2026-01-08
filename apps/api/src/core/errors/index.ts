/**
 * Sistema de Tratamento de Erros - Exportações Principais
 *
 * Este módulo exporta todas as classes, utilitários e gerenciadores
 * relacionados ao tratamento de erros no sistema.
 */

// Classes de erro
export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  BadGatewayError,
  BusinessLogicError,
  CircuitBreakerError,
  ConfigurationError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  GatewayTimeoutError,
  InternalServerError,
  MaintenanceModeError,
  NetworkError,
  NotFoundError,
  NotImplementedError,
  PayloadTooLargeError,
  PaymentRequiredError,
  PreconditionFailedError,
  RateLimitError,
  ResourceExhaustedError,
  ServiceUnavailableError,
  TimeoutError,
  TooManyRequestsError,
  UnprocessableEntityError,
  UnsupportedMediaTypeError,
  ValidationError,
} from "./app-error";
// Error analytics
export {
  ErrorAnalyticsManager,
  type ErrorGroup,
  type ErrorStats,
} from "./error-analytics";
// Códigos de erro padronizados
export {
  ErrorCategory,
  type ErrorCode,
  ErrorCodeCategoryMap,
  ErrorCodes,
  getErrorCategory,
  isCriticalError,
  isRecoverableError,
} from "./error-codes";
// Error context
export {
  ErrorContextManager,
  type RichErrorContext,
} from "./error-context";
// Sistema de correlação e tracing
export {
  type ErrorCorrelationContext,
  ErrorCorrelationManager,
  type ErrorSpan,
  type ErrorTraceInfo,
} from "./error-correlation";

// Error handler
export {
  asyncHandler,
  errorHandler,
  notFoundHandler,
} from "./error-handler";
// Sistema de métricas
export { ErrorMetricsManager } from "./error-metrics";
// Sistema de notificações
export {
  ErrorNotificationManager,
  ErrorSeverity,
  NotificationChannel,
  type NotificationConfig,
} from "./error-notification";
// Error prevention
export {
  type ErrorPattern,
  ErrorPreventionManager,
  type PreventionRule,
} from "./error-prevention";
// Error recovery
export {
  ErrorRecoveryManager,
  type RecoveryConfig,
  type RecoveryResult,
  RecoveryStrategy,
  withRecovery,
} from "./error-recovery";
