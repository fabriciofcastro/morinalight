/**
 * Sistema de Códigos de Erro Padronizados
 * 
 * Este arquivo define todos os códigos de erro utilizados no sistema,
 * garantindo consistência e facilitando a documentação e rastreamento.
 */

/**
 * Categorias de erro
 */
export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  DATABASE = "DATABASE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  TIMEOUT = "TIMEOUT",
  CIRCUIT_BREAKER = "CIRCUIT_BREAKER",
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  NETWORK = "NETWORK",
  CONFIGURATION = "CONFIGURATION",
  INTERNAL = "INTERNAL",
  MAINTENANCE = "MAINTENANCE",
}

/**
 * Códigos de erro padronizados
 */
export const ErrorCodes = {
  // Validation Errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_RANGE: "INVALID_RANGE",
  INVALID_TYPE: "INVALID_TYPE",

  // Authentication Errors (401)
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  TOKEN_MISSING: "TOKEN_MISSING",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",

  // Authorization Errors (403)
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  FORBIDDEN_RESOURCE: "FORBIDDEN_RESOURCE",
  ROLE_REQUIRED: "ROLE_REQUIRED",
  PERMISSION_DENIED: "PERMISSION_DENIED",

  // Not Found Errors (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ENTITY_NOT_FOUND: "ENTITY_NOT_FOUND",

  // Conflict Errors (409)
  CONFLICT: "CONFLICT",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
  RESOURCE_EXISTS: "RESOURCE_EXISTS",
  CONCURRENT_MODIFICATION: "CONCURRENT_MODIFICATION",

  // Business Logic Errors (422)
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  INVALID_STATE: "INVALID_STATE",
  INVALID_TRANSITION: "INVALID_TRANSITION",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",

  // Rate Limit Errors (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED",

  // Database Errors (500)
  DATABASE_ERROR: "DATABASE_ERROR",
  DATABASE_CONNECTION_ERROR: "DATABASE_CONNECTION_ERROR",
  DATABASE_QUERY_ERROR: "DATABASE_QUERY_ERROR",
  DATABASE_TRANSACTION_ERROR: "DATABASE_TRANSACTION_ERROR",
  DATABASE_CONSTRAINT_VIOLATION: "DATABASE_CONSTRAINT_VIOLATION",

  // External Service Errors (502)
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  BAD_GATEWAY: "BAD_GATEWAY",
  CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",

  // Timeout Errors (504)
  TIMEOUT: "TIMEOUT",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
  OPERATION_TIMEOUT: "OPERATION_TIMEOUT",

  // Network Errors (503)
  NETWORK_ERROR: "NETWORK_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",
  DNS_ERROR: "DNS_ERROR",

  // Configuration Errors (500)
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  MISSING_CONFIGURATION: "MISSING_CONFIGURATION",
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",

  // Internal Errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",

  // Maintenance (503)
  MAINTENANCE_MODE: "MAINTENANCE_MODE",

  // Payment (402)
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",

  // Precondition Failed (412)
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  ETAG_MISMATCH: "ETAG_MISMATCH",

  // Payload Too Large (413)
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",

  // Unsupported Media Type (415)
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",

  // Not Implemented (501)
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

/**
 * Tipo para códigos de erro
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Mapeamento de códigos para categorias
 */
export const ErrorCodeCategoryMap: Record<ErrorCode, ErrorCategory> = {
  // Validation
  [ErrorCodes.VALIDATION_ERROR]: ErrorCategory.VALIDATION,
  [ErrorCodes.INVALID_INPUT]: ErrorCategory.VALIDATION,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: ErrorCategory.VALIDATION,
  [ErrorCodes.INVALID_FORMAT]: ErrorCategory.VALIDATION,
  [ErrorCodes.INVALID_RANGE]: ErrorCategory.VALIDATION,
  [ErrorCodes.INVALID_TYPE]: ErrorCategory.VALIDATION,

  // Authentication
  [ErrorCodes.AUTHENTICATION_ERROR]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.INVALID_CREDENTIALS]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.TOKEN_EXPIRED]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.TOKEN_INVALID]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.TOKEN_MISSING]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.SESSION_EXPIRED]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.ACCOUNT_LOCKED]: ErrorCategory.AUTHENTICATION,
  [ErrorCodes.ACCOUNT_DISABLED]: ErrorCategory.AUTHENTICATION,

  // Authorization
  [ErrorCodes.AUTHORIZATION_ERROR]: ErrorCategory.AUTHORIZATION,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: ErrorCategory.AUTHORIZATION,
  [ErrorCodes.FORBIDDEN_RESOURCE]: ErrorCategory.AUTHORIZATION,
  [ErrorCodes.ROLE_REQUIRED]: ErrorCategory.AUTHORIZATION,
  [ErrorCodes.PERMISSION_DENIED]: ErrorCategory.AUTHORIZATION,

  // Not Found
  [ErrorCodes.NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCodes.RESOURCE_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCodes.ROUTE_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCodes.USER_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCodes.ENTITY_NOT_FOUND]: ErrorCategory.NOT_FOUND,

  // Conflict
  [ErrorCodes.CONFLICT]: ErrorCategory.CONFLICT,
  [ErrorCodes.DUPLICATE_RESOURCE]: ErrorCategory.CONFLICT,
  [ErrorCodes.RESOURCE_EXISTS]: ErrorCategory.CONFLICT,
  [ErrorCodes.CONCURRENT_MODIFICATION]: ErrorCategory.CONFLICT,

  // Business Logic
  [ErrorCodes.BUSINESS_LOGIC_ERROR]: ErrorCategory.BUSINESS_LOGIC,
  [ErrorCodes.UNPROCESSABLE_ENTITY]: ErrorCategory.BUSINESS_LOGIC,
  [ErrorCodes.INVALID_STATE]: ErrorCategory.BUSINESS_LOGIC,
  [ErrorCodes.INVALID_TRANSITION]: ErrorCategory.BUSINESS_LOGIC,
  [ErrorCodes.BUSINESS_RULE_VIOLATION]: ErrorCategory.BUSINESS_LOGIC,

  // Rate Limit
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: ErrorCategory.RATE_LIMIT,
  [ErrorCodes.TOO_MANY_REQUESTS]: ErrorCategory.RATE_LIMIT,
  [ErrorCodes.RESOURCE_EXHAUSTED]: ErrorCategory.RATE_LIMIT,

  // Database
  [ErrorCodes.DATABASE_ERROR]: ErrorCategory.DATABASE,
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: ErrorCategory.DATABASE,
  [ErrorCodes.DATABASE_QUERY_ERROR]: ErrorCategory.DATABASE,
  [ErrorCodes.DATABASE_TRANSACTION_ERROR]: ErrorCategory.DATABASE,
  [ErrorCodes.DATABASE_CONSTRAINT_VIOLATION]: ErrorCategory.DATABASE,

  // External Service
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: ErrorCategory.EXTERNAL_SERVICE,
  [ErrorCodes.SERVICE_UNAVAILABLE]: ErrorCategory.EXTERNAL_SERVICE,
  [ErrorCodes.BAD_GATEWAY]: ErrorCategory.EXTERNAL_SERVICE,
  [ErrorCodes.CIRCUIT_BREAKER_OPEN]: ErrorCategory.CIRCUIT_BREAKER,

  // Timeout
  [ErrorCodes.TIMEOUT]: ErrorCategory.TIMEOUT,
  [ErrorCodes.GATEWAY_TIMEOUT]: ErrorCategory.TIMEOUT,
  [ErrorCodes.OPERATION_TIMEOUT]: ErrorCategory.TIMEOUT,

  // Network
  [ErrorCodes.NETWORK_ERROR]: ErrorCategory.NETWORK,
  [ErrorCodes.CONNECTION_ERROR]: ErrorCategory.NETWORK,
  [ErrorCodes.DNS_ERROR]: ErrorCategory.NETWORK,

  // Configuration
  [ErrorCodes.CONFIGURATION_ERROR]: ErrorCategory.CONFIGURATION,
  [ErrorCodes.MISSING_CONFIGURATION]: ErrorCategory.CONFIGURATION,
  [ErrorCodes.INVALID_CONFIGURATION]: ErrorCategory.CONFIGURATION,

  // Internal
  [ErrorCodes.INTERNAL_ERROR]: ErrorCategory.INTERNAL,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: ErrorCategory.INTERNAL,
  [ErrorCodes.UNEXPECTED_ERROR]: ErrorCategory.INTERNAL,

  // Maintenance
  [ErrorCodes.MAINTENANCE_MODE]: ErrorCategory.MAINTENANCE,

  // Payment
  [ErrorCodes.PAYMENT_REQUIRED]: ErrorCategory.INTERNAL,
  [ErrorCodes.SUBSCRIPTION_EXPIRED]: ErrorCategory.INTERNAL,

  // Precondition
  [ErrorCodes.PRECONDITION_FAILED]: ErrorCategory.INTERNAL,
  [ErrorCodes.ETAG_MISMATCH]: ErrorCategory.INTERNAL,

  // Payload
  [ErrorCodes.PAYLOAD_TOO_LARGE]: ErrorCategory.INTERNAL,

  // Media Type
  [ErrorCodes.UNSUPPORTED_MEDIA_TYPE]: ErrorCategory.INTERNAL,

  // Not Implemented
  [ErrorCodes.NOT_IMPLEMENTED]: ErrorCategory.INTERNAL,
};

/**
 * Obter categoria de um código de erro
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  return ErrorCodeCategoryMap[code] || ErrorCategory.INTERNAL;
}

/**
 * Verificar se um código de erro é recuperável
 */
export function isRecoverableError(code: ErrorCode): boolean {
  const category = getErrorCategory(code);
  return [
    ErrorCategory.NETWORK,
    ErrorCategory.TIMEOUT,
    ErrorCategory.EXTERNAL_SERVICE,
    ErrorCategory.CIRCUIT_BREAKER,
    ErrorCategory.DATABASE,
  ].includes(category);
}

/**
 * Verificar se um código de erro é crítico
 */
export function isCriticalError(code: ErrorCode): boolean {
  const category = getErrorCategory(code);
  return [
    ErrorCategory.DATABASE,
    ErrorCategory.CONFIGURATION,
    ErrorCategory.INTERNAL,
  ].includes(category);
}

