/**
 * Sistema de Métricas de Erros
 * 
 * Coleta e expõe métricas detalhadas sobre erros para monitoramento
 * e alertas.
 */

import { Counter, Histogram, Registry } from "prom-client";
import type { AppError } from "./app-error";
import { ErrorCategory, getErrorCategory, isCriticalError, type ErrorCode } from "./error-codes";
import type { ErrorCorrelationContext } from "./error-correlation";

/**
 * Registry de métricas de erro
 */
const errorMetricsRegistry = new Registry();

/**
 * Contador de erros por código
 */
const errorCounterByCode = new Counter({
  name: "morina_errors_total",
  help: "Total de erros por código de erro",
  labelNames: ["code", "category", "is_operational", "is_critical"],
  registers: [errorMetricsRegistry],
});

/**
 * Contador de erros por status HTTP
 */
const errorCounterByStatus = new Counter({
  name: "morina_errors_by_status_total",
  help: "Total de erros por status HTTP",
  labelNames: ["status_code", "category"],
  registers: [errorMetricsRegistry],
});

/**
 * Histograma de duração de requisições com erro
 */
const errorRequestDuration = new Histogram({
  name: "morina_error_request_duration_seconds",
  help: "Duração de requisições que resultaram em erro",
  labelNames: ["code", "status_code", "category"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10, 30],
  registers: [errorMetricsRegistry],
});

/**
 * Contador de erros críticos
 */
const criticalErrorCounter = new Counter({
  name: "morina_critical_errors_total",
  help: "Total de erros críticos",
  labelNames: ["code", "service", "environment"],
  registers: [errorMetricsRegistry],
});

/**
 * Contador de erros por serviço externo
 */
const externalServiceErrorCounter = new Counter({
  name: "morina_external_service_errors_total",
  help: "Total de erros de serviços externos",
  labelNames: ["service", "code", "status_code"],
  registers: [errorMetricsRegistry],
});

/**
 * Contador de erros de banco de dados
 */
const databaseErrorCounter = new Counter({
  name: "morina_database_errors_total",
  help: "Total de erros de banco de dados",
  labelNames: ["code", "operation"],
  registers: [errorMetricsRegistry],
});

/**
 * Gauge de taxa de erro atual
 */
const errorRateGauge = new Histogram({
  name: "morina_error_rate",
  help: "Taxa de erro por minuto",
  labelNames: ["category"],
  buckets: [0, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [errorMetricsRegistry],
});

/**
 * Gerenciador de métricas de erro
 */
export class ErrorMetricsManager {
  /**
   * Registrar um erro nas métricas
   */
  static recordError(
    error: AppError,
    context?: ErrorCorrelationContext,
    requestDuration?: number,
  ): void {
    const code = error.code as ErrorCode;
    const category = getErrorCategory(code);
    const isCritical = isCriticalError(code);
    const statusCode = String(error.statusCode);

    // Incrementar contador por código
    errorCounterByCode.inc({
      code,
      category,
      is_operational: String(error.isOperational),
      is_critical: String(isCritical),
    });

    // Incrementar contador por status
    errorCounterByStatus.inc({
      status_code: statusCode,
      category,
    });

    // Registrar duração se disponível
    if (requestDuration !== undefined) {
      errorRequestDuration.observe(
        {
          code,
          status_code: statusCode,
          category,
        },
        requestDuration,
      );
    }

    // Registrar erro crítico
    if (isCritical) {
      criticalErrorCounter.inc({
        code,
        service: context?.service || "unknown",
        environment: context?.environment || "unknown",
      });
    }

    // Registrar erro de serviço externo
    if (category === ErrorCategory.EXTERNAL_SERVICE) {
      const service =
        (error as { service?: string }).service || "unknown";
      externalServiceErrorCounter.inc({
        service,
        code,
        status_code: statusCode,
      });
    }

    // Registrar erro de banco de dados
    if (category === ErrorCategory.DATABASE) {
      const operation =
        (error.context?.operation as string) || "unknown";
      databaseErrorCounter.inc({
        code,
        operation,
      });
    }

    // Registrar taxa de erro
    errorRateGauge.observe({ category }, 1);
  }

  /**
   * Obter registry de métricas
   */
  static getRegistry(): Registry {
    return errorMetricsRegistry;
  }

  /**
   * Obter métricas como string Prometheus
   */
  static async getMetrics(): Promise<string> {
    return await errorMetricsRegistry.metrics();
  }

  /**
   * Resetar todas as métricas (útil para testes)
   */
  static reset(): void {
    errorMetricsRegistry.resetMetrics();
  }
}



