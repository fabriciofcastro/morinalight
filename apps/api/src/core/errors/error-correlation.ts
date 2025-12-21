/**
 * Sistema de Correlação e Tracing de Erros
 * 
 * Fornece rastreamento avançado de erros com correlação de requisições,
 * spans distribuídos e contexto de execução.
 */

import { randomUUID } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { AppError } from "./app-error";

/**
 * Contexto de correlação de erro
 */
export interface ErrorCorrelationContext {
  correlationId: string;
  requestId: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  userId?: string;
  orgId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: number;
  environment: string;
  service: string;
  version: string;
}

/**
 * Informações adicionais de tracing
 */
export interface ErrorTraceInfo {
  stack?: string;
  cause?: ErrorTraceInfo;
  spans: ErrorSpan[];
  metadata: Record<string, unknown>;
}

/**
 * Span de erro para distributed tracing
 */
export interface ErrorSpan {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  tags: Record<string, string | number | boolean>;
  logs: Array<{ timestamp: number; message: string; level: string }>;
  error?: boolean;
}

/**
 * Gerenciador de correlação de erros
 */
export class ErrorCorrelationManager {
  private static readonly CORRELATION_HEADER = "x-correlation-id";
  private static readonly TRACE_HEADER = "x-trace-id";
  private static readonly SPAN_HEADER = "x-span-id";
  private static readonly PARENT_SPAN_HEADER = "x-parent-span-id";

  /**
   * Extrair contexto de correlação da requisição
   */
  static extractFromRequest(request: FastifyRequest): ErrorCorrelationContext {
    const correlationId =
      (request.headers[this.CORRELATION_HEADER] as string) ||
      (request.id as string) ||
      randomUUID();
    const traceId =
      (request.headers[this.TRACE_HEADER] as string) || randomUUID();
    const spanId =
      (request.headers[this.SPAN_HEADER] as string) || randomUUID();
    const parentSpanId = request.headers[this.PARENT_SPAN_HEADER] as
      | string
      | undefined;

    return {
      correlationId,
      requestId: request.id as string,
      traceId,
      spanId,
      parentSpanId,
      userId: (request.user as { userId?: string })?.userId,
      orgId: (request.headers["x-org-id"] as string) || undefined,
      sessionId: (request.headers["x-session-id"] as string) || undefined,
      userAgent: request.headers["user-agent"],
      ip: request.ip,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || "development",
      service: "morina-api",
      version: process.env.APP_VERSION || "unknown",
    };
  }

  /**
   * Criar contexto de correlação
   */
  static createContext(
    parentContext?: ErrorCorrelationContext,
  ): ErrorCorrelationContext {
    const traceId = parentContext?.traceId || randomUUID();
    const correlationId = parentContext?.correlationId || randomUUID();

    return {
      correlationId,
      requestId: randomUUID(),
      traceId,
      spanId: randomUUID(),
      parentSpanId: parentContext?.spanId,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || "development",
      service: "morina-api",
      version: process.env.APP_VERSION || "unknown",
    };
  }

  /**
   * Adicionar contexto de correlação ao erro
   */
  static enrichError(
    error: AppError,
    context: ErrorCorrelationContext,
  ): AppError {
    return new (error.constructor as typeof AppError)(
      error.code,
      error.message,
      error.statusCode,
      {
        isOperational: error.isOperational,
        context: {
          ...error.context,
          correlation: context,
        },
        cause: error.cause,
      },
    );
  }

  /**
   * Extrair informações de trace do erro
   */
  static extractTraceInfo(error: Error): ErrorTraceInfo {
    const spans: ErrorSpan[] = [];
    const metadata: Record<string, unknown> = {};

    // Extrair stack trace
    let stack: string | undefined;
    if (error.stack) {
      stack = error.stack;
    }

    // Extrair causa recursivamente
    let cause: ErrorTraceInfo | undefined;
    if (error.cause && error.cause instanceof Error) {
      cause = this.extractTraceInfo(error.cause);
    }

    // Extrair spans do contexto se disponível
    if (error instanceof Error && "context" in error) {
      const context = (error as { context?: Record<string, unknown> }).context;
      if (context && "spans" in context) {
        spans.push(...(context.spans as ErrorSpan[]));
      }
      if (context && "metadata" in context) {
        Object.assign(metadata, context.metadata);
      }
    }

    return {
      stack,
      cause,
      spans,
      metadata,
    };
  }

  /**
   * Criar um novo span
   */
  static createSpan(
    name: string,
    parentContext?: ErrorCorrelationContext,
  ): {
    span: ErrorSpan;
    context: ErrorCorrelationContext;
    end: () => void;
  } {
    const context = this.createContext(parentContext);
    const startTime = Date.now();
    const spanId = context.spanId;

    const span: ErrorSpan = {
      id: spanId,
      name,
      startTime,
      endTime: startTime,
      duration: 0,
      tags: {},
      logs: [],
      error: false,
    };

    const end = () => {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
    };

    return { span, context, end };
  }

  /**
   * Adicionar log ao span
   */
  static addSpanLog(
    span: ErrorSpan,
    message: string,
    level: string = "info",
  ): void {
    span.logs.push({
      timestamp: Date.now(),
      message,
      level,
    });
  }

  /**
   * Adicionar tag ao span
   */
  static addSpanTag(
    span: ErrorSpan,
    key: string,
    value: string | number | boolean,
  ): void {
    span.tags[key] = value;
  }

  /**
   * Marcar span como erro
   */
  static markSpanAsError(span: ErrorSpan, error: Error): void {
    span.error = true;
    this.addSpanTag(span, "error", true);
    this.addSpanTag(span, "error.message", error.message);
    this.addSpanTag(span, "error.type", error.constructor.name);
    if (error.stack) {
      this.addSpanLog(span, error.stack, "error");
    }
  }

  /**
   * Serializar contexto para headers HTTP
   */
  static toHeaders(context: ErrorCorrelationContext): Record<string, string> {
    return {
      [this.CORRELATION_HEADER]: context.correlationId,
      [this.TRACE_HEADER]: context.traceId,
      [this.SPAN_HEADER]: context.spanId,
      ...(context.parentSpanId && {
        [this.PARENT_SPAN_HEADER]: context.parentSpanId,
      }),
    };
  }
}



