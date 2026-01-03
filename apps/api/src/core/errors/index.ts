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

// Códigos de erro padronizados
export {
  ErrorCategory,
  ErrorCodes,
  ErrorCodeCategoryMap,
  getErrorCategory,
  isCriticalError,
  isRecoverableError,
  type ErrorCode,
} from "./error-codes";

// Sistema de correlação e tracing
export {
  ErrorCorrelationManager,
  type ErrorCorrelationContext,
  type ErrorSpan,
  type ErrorTraceInfo,
} from "./error-correlation";

// Sistema de métricas
export { ErrorMetricsManager } from "./error-metrics";

// Sistema de notificações
export {
  ErrorNotificationManager,
  NotificationChannel,
  ErrorSeverity,
  type NotificationConfig,
} from "./error-notification";

// Error handler
export {
  asyncHandler,
  errorHandler,
  notFoundHandler,
} from "./error-handler";

// Error recovery
export {
  ErrorRecoveryManager,
  RecoveryStrategy,
  withRecovery,
  type RecoveryResult,
  type RecoveryConfig,
} from "./error-recovery";

// Error analytics
export {
  ErrorAnalyticsManager,
  type ErrorGroup,
  type ErrorStats,
} from "./error-analytics";

// Error context
export {
  ErrorContextManager,
  type RichErrorContext,
} from "./error-context";

// Error prevention
export {
  ErrorPreventionManager,
  type ErrorPattern,
  type PreventionRule,
} from "./error-prevention";

