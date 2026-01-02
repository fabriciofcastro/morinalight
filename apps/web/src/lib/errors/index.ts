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
export { AdvancedErrorBoundary } from "./advanced-error-boundary";

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

// Error Tracking
export { errorTracking } from "./error-tracking";

// Retry Logic
export {
  RetryManager,
  RetryPolicies,
  withRetry,
  useRetry,
  type RetryConfig,
} from "./retry-logic";

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitState,
  circuitBreakerManager,
  CircuitConfigs,
  CircuitBreakerOpenError,
  type CircuitConfig,
} from "./circuit-breaker";

// Performance Monitoring
export {
  performanceMonitor,
  usePerformanceMonitor,
  type PerformanceMetric,
  type PerformanceStats,
  type PerformanceAlert,
} from "./performance-monitor";

// Error Aggregation
export {
  errorAggregator,
  type ErrorGroup,
  type AggregationConfig,
} from "./error-aggregation";

// Recovery Strategies
export {
  recoveryManager,
  cacheResponse,
  useRecovery,
  type RecoveryStrategy,
  CacheFallbackStrategy,
  GracefulDegradationStrategy,
  OfflineQueueStrategy,
  CustomRetryStrategy,
  MockDataFallbackStrategy,
} from "./recovery-strategies";

// Contextual Handlers
export {
  contextualHandlerManager,
  useContextualErrorHandler,
  type ContextualErrorHandler,
  authErrorHandler,
  paymentErrorHandler,
  uploadErrorHandler,
  apiErrorHandler,
  formErrorHandler,
} from "./contextual-handlers";

// Error Prediction & Health Monitoring
export {
  errorPrediction,
  healthMonitor,
  useErrorPrediction,
  useHealthMonitor,
  HealthLevel,
  type ErrorPrediction,
  type HealthMetric,
} from "./error-prediction";

// Error Documentation
export {
  errorDocGenerator,
  bestPracticesGenerator,
  type ErrorDocumentation,
} from "./error-documentation";

