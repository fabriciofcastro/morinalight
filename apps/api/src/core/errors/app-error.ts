/**
 * Base error class for all application errors
 * Provides structured error handling with codes, status codes, and context
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    options?: {
      isOperational?: boolean;
      context?: Record<string, unknown>;
      cause?: Error;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.context = options?.context;
    this.cause = options?.cause;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for API responses
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Validation error - for invalid input data
 */
export class ValidationError extends AppError {
  public readonly fields: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    fields: Array<{ field: string; message: string }> = [],
    context?: Record<string, unknown>,
  ) {
    super("VALIDATION_ERROR", message, 400, { isOperational: true, context });
    this.fields = fields;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        fields: this.fields,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Authentication error - for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", context?: Record<string, unknown>) {
    super("AUTHENTICATION_ERROR", message, 401, { isOperational: true, context });
  }
}

/**
 * Authorization error - for permission failures
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", context?: Record<string, unknown>) {
    super("AUTHORIZATION_ERROR", message, 403, { isOperational: true, context });
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, context?: Record<string, unknown>) {
    const message = identifier
      ? `${resource} with identifier ${identifier} not found`
      : `${resource} not found`;
    super("NOT_FOUND", message, 404, {
      isOperational: true,
      context: { resource, identifier, ...context },
    });
  }
}

/**
 * Conflict error - for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("CONFLICT", message, 409, { isOperational: true, context });
  }
}

/**
 * Rate limit error - for rate limiting
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number, message?: string, context?: Record<string, unknown>) {
    super(
      "RATE_LIMIT_EXCEEDED",
      message || "Too many requests. Please try again later.",
      429,
      { isOperational: true, context },
    );
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        retryAfter: this.retryAfter,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Database error - for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
    super("DATABASE_ERROR", message, 500, {
      isOperational: false,
      cause,
      context,
    });
  }
}

/**
 * External service error - for third-party service failures
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(
    service: string,
    message: string,
    statusCode: number = 502,
    cause?: Error,
    context?: Record<string, unknown>,
  ) {
    super("EXTERNAL_SERVICE_ERROR", message, statusCode, {
      isOperational: false,
      cause,
      context: { service, ...context },
    });
    this.service = service;
  }
}

/**
 * Timeout error - for operation timeouts
 */
export class TimeoutError extends AppError {
  public readonly timeout: number;

  constructor(message: string, timeout: number, context?: Record<string, unknown>) {
    super("TIMEOUT", message, 504, {
      isOperational: false,
      context: { timeout, ...context },
    });
    this.timeout = timeout;
  }
}

/**
 * Circuit breaker error - when circuit breaker is open
 */
export class CircuitBreakerError extends AppError {
  public readonly service: string;

  constructor(service: string, context?: Record<string, unknown>) {
    super(
      "CIRCUIT_BREAKER_OPEN",
      `Service ${service} is currently unavailable. Please try again later.`,
      503,
      {
        isOperational: true,
        context: { service, ...context },
      },
    );
    this.service = service;
  }
}

/**
 * Business logic error - for domain rule violations
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("BUSINESS_LOGIC_ERROR", message, 422, {
      isOperational: true,
      context,
    });
  }
}

/**
 * Unprocessable entity error - for semantic validation failures
 */
export class UnprocessableEntityError extends AppError {
  public readonly fields: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    fields: Array<{ field: string; message: string }> = [],
    context?: Record<string, unknown>,
  ) {
    super("UNPROCESSABLE_ENTITY", message, 422, {
      isOperational: true,
      context,
    });
    this.fields = fields;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        fields: this.fields,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Payment required error - for payment/subscription issues
 */
export class PaymentRequiredError extends AppError {
  constructor(message: string = "Payment required", context?: Record<string, unknown>) {
    super("PAYMENT_REQUIRED", message, 402, {
      isOperational: true,
      context,
    });
  }
}

/**
 * Precondition failed error - for conditional operations
 */
export class PreconditionFailedError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("PRECONDITION_FAILED", message, 412, {
      isOperational: true,
      context,
    });
  }
}

/**
 * Payload too large error - for oversized requests
 */
export class PayloadTooLargeError extends AppError {
  public readonly maxSize: number;
  public readonly actualSize: number;

  constructor(maxSize: number, actualSize: number, context?: Record<string, unknown>) {
    super(
      "PAYLOAD_TOO_LARGE",
      `Request payload exceeds maximum size of ${maxSize} bytes`,
      413,
      {
        isOperational: true,
        context: { maxSize, actualSize, ...context },
      },
    );
    this.maxSize = maxSize;
    this.actualSize = actualSize;
  }
}

/**
 * Unsupported media type error
 */
export class UnsupportedMediaTypeError extends AppError {
  public readonly contentType: string;

  constructor(contentType: string, context?: Record<string, unknown>) {
    super(
      "UNSUPPORTED_MEDIA_TYPE",
      `Content type ${contentType} is not supported`,
      415,
      {
        isOperational: true,
        context: { contentType, ...context },
      },
    );
    this.contentType = contentType;
  }
}

/**
 * Too many requests error - alternative to RateLimitError with more context
 */
export class TooManyRequestsError extends AppError {
  public readonly retryAfter: number;
  public readonly limit: number;
  public readonly remaining: number;

  constructor(
    retryAfter: number,
    limit: number,
    remaining: number,
    message?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      "TOO_MANY_REQUESTS",
      message || "Too many requests. Please try again later.",
      429,
      {
        isOperational: true,
        context: { retryAfter, limit, remaining, ...context },
      },
    );
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        retryAfter: this.retryAfter,
        limit: this.limit,
        remaining: this.remaining,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Internal server error - for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = "An internal server error occurred", context?: Record<string, unknown>) {
    super("INTERNAL_SERVER_ERROR", message, 500, {
      isOperational: false,
      context,
    });
  }
}

/**
 * Bad gateway error - for upstream server errors
 */
export class BadGatewayError extends AppError {
  public readonly upstream: string;

  constructor(upstream: string, message?: string, context?: Record<string, unknown>) {
    super(
      "BAD_GATEWAY",
      message || `Bad gateway to upstream service: ${upstream}`,
      502,
      {
        isOperational: false,
        context: { upstream, ...context },
      },
    );
    this.upstream = upstream;
  }
}

/**
 * Service unavailable error - for temporary unavailability
 */
export class ServiceUnavailableError extends AppError {
  public readonly service: string;
  public readonly retryAfter?: number;

  constructor(
    service: string,
    retryAfter?: number,
    message?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      "SERVICE_UNAVAILABLE",
      message || `Service ${service} is temporarily unavailable`,
      503,
      {
        isOperational: true,
        context: { service, retryAfter, ...context },
      },
    );
    this.service = service;
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        service: this.service,
        ...(this.retryAfter && { retryAfter: this.retryAfter }),
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Gateway timeout error
 */
export class GatewayTimeoutError extends AppError {
  public readonly timeout: number;
  public readonly upstream: string;

  constructor(upstream: string, timeout: number, context?: Record<string, unknown>) {
    super(
      "GATEWAY_TIMEOUT",
      `Gateway timeout after ${timeout}ms for ${upstream}`,
      504,
      {
        isOperational: false,
        context: { upstream, timeout, ...context },
      },
    );
    this.timeout = timeout;
    this.upstream = upstream;
  }
}

/**
 * Network error - for network-related failures
 */
export class NetworkError extends AppError {
  public readonly host?: string;
  public readonly port?: number;

  constructor(
    message: string,
    host?: string,
    port?: number,
    context?: Record<string, unknown>,
  ) {
    super("NETWORK_ERROR", message, 503, {
      isOperational: false,
      context: { host, port, ...context },
    });
    this.host = host;
    this.port = port;
  }
}

/**
 * Configuration error - for misconfiguration issues
 */
export class ConfigurationError extends AppError {
  public readonly configKey: string;

  constructor(configKey: string, message?: string, context?: Record<string, unknown>) {
    super(
      "CONFIGURATION_ERROR",
      message || `Configuration error for key: ${configKey}`,
      500,
      {
        isOperational: false,
        context: { configKey, ...context },
      },
    );
    this.configKey = configKey;
  }
}

/**
 * Resource exhausted error - for resource limit violations
 */
export class ResourceExhaustedError extends AppError {
  public readonly resource: string;
  public readonly limit: number;

  constructor(
    resource: string,
    limit: number,
    message?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      "RESOURCE_EXHAUSTED",
      message || `Resource ${resource} exhausted. Limit: ${limit}`,
      429,
      {
        isOperational: true,
        context: { resource, limit, ...context },
      },
    );
    this.resource = resource;
    this.limit = limit;
  }
}

/**
 * Not implemented error - for unimplemented features
 */
export class NotImplementedError extends AppError {
  constructor(feature: string, context?: Record<string, unknown>) {
    super(
      "NOT_IMPLEMENTED",
      `Feature ${feature} is not implemented`,
      501,
      {
        isOperational: true,
        context: { feature, ...context },
      },
    );
  }
}

/**
 * Maintenance mode error
 */
export class MaintenanceModeError extends AppError {
  public readonly estimatedDuration?: number;

  constructor(estimatedDuration?: number, context?: Record<string, unknown>) {
    super(
      "MAINTENANCE_MODE",
      "Service is currently under maintenance",
      503,
      {
        isOperational: true,
        context: { estimatedDuration, ...context },
      },
    );
    this.estimatedDuration = estimatedDuration;
  }
}











