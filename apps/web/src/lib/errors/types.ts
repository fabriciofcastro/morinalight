/**
 * Tipos de Erro - Frontend
 * 
 * Define os tipos de erro utilizados no frontend,
 * compatíveis com o sistema de erros do backend.
 */

/**
 * Estrutura de erro da API
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Array<{ field: string; message: string }>;
    context?: Record<string, unknown>;
    retryAfter?: number;
    correlation?: {
      correlationId: string;
      traceId: string;
      requestId: string;
    };
  };
}

/**
 * Códigos de erro conhecidos
 */
export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Authentication
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Authorization
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  FORBIDDEN_RESOURCE = "FORBIDDEN_RESOURCE",

  // Not Found
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // Conflict
  CONFLICT = "CONFLICT",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",

  // Rate Limit
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Server Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  TIMEOUT = "TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
}

/**
 * Categoria de erro
 */
export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  SERVER = "SERVER",
  NETWORK = "NETWORK",
}

/**
 * Severidade do erro
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Classe de erro customizada para o frontend
 */
export class AppError extends Error {
  public readonly code: ErrorCode | string;
  public readonly statusCode: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly fields?: Array<{ field: string; message: string }>;
  public readonly context?: Record<string, unknown>;
  public readonly correlationId?: string;
  public readonly traceId?: string;
  public readonly requestId?: string;
  public readonly retryAfter?: number;
  public readonly isRetryable: boolean;

  constructor(
    code: ErrorCode | string,
    message: string,
    statusCode: number = 500,
    options?: {
      fields?: Array<{ field: string; message: string }>;
      context?: Record<string, unknown>;
      correlationId?: string;
      traceId?: string;
      requestId?: string;
      retryAfter?: number;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.category = this.determineCategory(code, statusCode);
    this.severity = this.determineSeverity(statusCode);
    this.fields = options?.fields;
    this.context = options?.context;
    this.correlationId = options?.correlationId;
    this.traceId = options?.traceId;
    this.requestId = options?.requestId;
    this.retryAfter = options?.retryAfter;
    this.isRetryable = this.determineRetryable(code, statusCode);

    // Manter stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private determineCategory(
    code: ErrorCode | string,
    statusCode: number,
  ): ErrorCategory {
    if (statusCode >= 500) {
      return ErrorCategory.SERVER;
    }

    if (statusCode === 0 || statusCode >= 600) {
      return ErrorCategory.NETWORK;
    }

    const codeStr = String(code);
    if (codeStr.includes("VALIDATION") || codeStr.includes("INVALID")) {
      return ErrorCategory.VALIDATION;
    }
    if (codeStr.includes("AUTHENTICATION") || codeStr.includes("TOKEN")) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (codeStr.includes("AUTHORIZATION") || codeStr.includes("PERMISSION")) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (codeStr.includes("NOT_FOUND")) {
      return ErrorCategory.NOT_FOUND;
    }
    if (codeStr.includes("CONFLICT") || codeStr.includes("DUPLICATE")) {
      return ErrorCategory.CONFLICT;
    }
    if (codeStr.includes("RATE_LIMIT") || codeStr.includes("TOO_MANY")) {
      return ErrorCategory.RATE_LIMIT;
    }

    return ErrorCategory.SERVER;
  }

  private determineSeverity(statusCode: number): ErrorSeverity {
    if (statusCode >= 500) {
      return ErrorSeverity.CRITICAL;
    }
    if (statusCode >= 400 && statusCode < 500) {
      return ErrorSeverity.MEDIUM;
    }
    if (statusCode === 0 || statusCode >= 600) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.LOW;
  }

  private determineRetryable(
    code: ErrorCode | string,
    statusCode: number,
  ): boolean {
    // Erros de rede são sempre retryable
    if (statusCode === 0 || statusCode >= 600) {
      return true;
    }

    // Erros de servidor são geralmente retryable
    if (statusCode >= 500 && statusCode < 600) {
      const codeStr = String(code);
      // Exceto alguns erros específicos
      if (
        codeStr.includes("VALIDATION") ||
        codeStr.includes("CONFIGURATION") ||
        codeStr.includes("NOT_IMPLEMENTED")
      ) {
        return false;
      }
      return true;
    }

    // Rate limit é retryable após o período de retry
    if (statusCode === 429) {
      return true;
    }

    // Timeout é retryable
    if (code === ErrorCode.TIMEOUT) {
      return true;
    }

    return false;
  }

  /**
   * Obter mensagem amigável para o usuário
   * 
   * @deprecated Use getUserFriendlyMessage() de user-messages.ts para mensagens mais completas
   */
  getUserMessage(): string {
    // Mensagens específicas por código
    switch (this.code) {
      case ErrorCode.INVALID_CREDENTIALS:
        return "Email ou senha incorretos. Verifique suas credenciais.";
      case ErrorCode.TOKEN_EXPIRED:
        return "Sua sessão expirou. Por favor, faça login novamente.";
      case ErrorCode.SESSION_EXPIRED:
        return "Sua sessão expirou. Por favor, faça login novamente.";
      case ErrorCode.INSUFFICIENT_PERMISSIONS:
        return "Você não tem permissão para realizar esta ação.";
      case ErrorCode.RESOURCE_NOT_FOUND:
        return "O recurso solicitado não foi encontrado.";
      case ErrorCode.DUPLICATE_RESOURCE:
        return "Este recurso já existe.";
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return "Muitas requisições. Por favor, aguarde um momento.";
      case ErrorCode.NETWORK_ERROR:
        return "Erro de conexão. Verifique sua internet e tente novamente.";
      case ErrorCode.TIMEOUT:
        return "A requisição demorou muito. Tente novamente.";
      case ErrorCode.SERVICE_UNAVAILABLE:
        return "Serviço temporariamente indisponível. Tente novamente em alguns instantes.";
      default:
        // Usar mensagem do erro ou mensagem genérica
        return (
          this.message ||
          "Ocorreu um erro inesperado. Por favor, tente novamente."
        );
    }
  }

  /**
   * Serializar para JSON
   */
  toJSON(): ApiErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields && { fields: this.fields }),
        ...(this.context && { context: this.context }),
        ...(this.retryAfter && { retryAfter: this.retryAfter }),
        ...(this.correlationId && {
          correlation: {
            correlationId: this.correlationId,
            traceId: this.traceId || "",
            requestId: this.requestId || "",
          },
        }),
      },
    };
  }
}

