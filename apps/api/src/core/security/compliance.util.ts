/**
 * Security Compliance Utility
 *
 * Provides helper functions to ensure all pages/routes follow security standards
 */

import type { FastifyReply, FastifyRequest } from "fastify";

export interface SecurityCheckResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

export interface AuditLogData {
  userId: string;
  orgId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Checklist de Conformidade - Frontend
 */
export class FrontendSecurityChecklist {
  private issues: string[] = [];
  private warnings: string[] = [];

  /**
   * ✅ Implementa useSession() para autenticação
   */
  checkAuthentication(hasUseSession: boolean): this {
    if (!hasUseSession) {
      this.issues.push("Missing useSession() for authentication");
    }
    return this;
  }

  /**
   * ✅ Implementa useAbility() para autorização
   */
  checkAuthorization(hasUseAbility: boolean): this {
    if (!hasUseAbility) {
      this.issues.push("Missing useAbility() for authorization");
    }
    return this;
  }

  /**
   * ✅ Verifica permissões antes de renderizar
   */
  checkPermissionValidation(hasPermissionCheck: boolean): this {
    if (!hasPermissionCheck) {
      this.issues.push("Missing permission validation before rendering");
    }
    return this;
  }

  /**
   * ✅ Redireciona para login se não autenticado
   */
  checkLoginRedirect(hasRedirect: boolean): this {
    if (!hasRedirect) {
      this.issues.push("Missing redirect to login for unauthenticated users");
    }
    return this;
  }

  /**
   * ✅ Mostra mensagem de "Acesso Negado" se sem permissão
   */
  checkAccessDeniedMessage(hasAccessDenied: boolean): this {
    if (!hasAccessDenied) {
      this.warnings.push("Missing 'Access Denied' message for unauthorized users");
    }
    return this;
  }

  /**
   * ✅ Usa CSRF token em formulários
   */
  checkCSRFToken(hasCSRF: boolean): this {
    if (!hasCSRF) {
      this.warnings.push("Missing CSRF token in forms");
    }
    return this;
  }

  /**
   * ✅ Sanitiza inputs do usuário
   */
  checkInputSanitization(hasSanitization: boolean): this {
    if (!hasSanitization) {
      this.issues.push("Missing input sanitization");
    }
    return this;
  }

  /**
   * ✅ Valida dados antes de enviar
   */
  checkInputValidation(hasValidation: boolean): this {
    if (!hasValidation) {
      this.issues.push("Missing input validation before submission");
    }
    return this;
  }

  getResult(): SecurityCheckResult {
    return {
      passed: this.issues.length === 0,
      issues: this.issues,
      warnings: this.warnings,
    };
  }
}

/**
 * Checklist de Conformidade - Backend
 */
export class BackendSecurityChecklist {
  private issues: string[] = [];
  private warnings: string[] = [];

  /**
   * ✅ Usa preHandler: app.authenticate em rotas protegidas
   */
  checkAuthentication(hasAuthentication: boolean): this {
    if (!hasAuthentication) {
      this.issues.push("Missing authentication middleware (app.authenticate)");
    }
    return this;
  }

  /**
   * ✅ Implementa verificação de permissões
   */
  checkPermissionVerification(hasPermissionCheck: boolean): this {
    if (!hasPermissionCheck) {
      this.issues.push("Missing permission verification");
    }
    return this;
  }

  /**
   * ✅ Define schema de validação (TypeBox)
   */
  checkSchemaValidation(hasSchema: boolean): this {
    if (!hasSchema) {
      this.issues.push("Missing schema validation (TypeBox)");
    }
    return this;
  }

  /**
   * ✅ Implementa rate limiting apropriado
   */
  checkRateLimiting(hasRateLimit: boolean): this {
    if (!hasRateLimit) {
      this.warnings.push("Missing rate limiting configuration");
    }
    return this;
  }

  /**
   * ✅ Registra ações em auditoria
   */
  checkAuditLogging(hasAuditLog: boolean): this {
    if (!hasAuditLog) {
      this.issues.push("Missing audit logging");
    }
    return this;
  }

  /**
   * ✅ Sanitiza inputs
   */
  checkInputSanitization(hasSanitization: boolean): this {
    if (!hasSanitization) {
      this.issues.push("Missing input sanitization");
    }
    return this;
  }

  /**
   * ✅ Retorna erros apropriados (401, 403, etc.)
   */
  checkErrorHandling(hasProperErrors: boolean): this {
    if (!hasProperErrors) {
      this.warnings.push("Missing proper error status codes (401, 403, etc.)");
    }
    return this;
  }

  /**
   * ✅ Usa HTTPS em produção
   */
  checkHTTPS(isProduction: boolean, hasHTTPS: boolean): this {
    if (isProduction && !hasHTTPS) {
      this.issues.push("HTTPS not enforced in production");
    }
    return this;
  }

  getResult(): SecurityCheckResult {
    return {
      passed: this.issues.length === 0,
      issues: this.issues,
      warnings: this.warnings,
    };
  }
}

/**
 * Helper: Verificar permissão
 */
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  // TODO: Integrar com sistema de permissões CASL
  // Por enquanto, retorna true para não bloquear desenvolvimento
  console.log(`[SECURITY] Checking permission: ${permission} for user: ${userId}`);
  return true;
}

/**
 * Helper: Registrar auditoria
 */
export async function auditLog(data: AuditLogData): Promise<void> {
  // TODO: Integrar com sistema de auditoria v3.0
  console.log("[AUDIT]", {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Helper: Sanitizar input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/script/gi, "") // Remove script tags
    .trim();
}

/**
 * Helper: Validar CSRF token
 */
export function validateCSRFToken(request: FastifyRequest, reply: FastifyReply): boolean {
  const token = request.headers["x-csrf-token"];

  if (!token) {
    reply.status(403).send({
      error: "Forbidden",
      message: "CSRF token missing",
    });
    return false;
  }

  // TODO: Validar token real
  return true;
}

/**
 * Middleware: Verificar conformidade de segurança
 */
export async function securityComplianceMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const checker = new BackendSecurityChecklist();

  // Verificar autenticação
  const hasAuth = !!(request as any).user;
  checker.checkAuthentication(hasAuth);

  // Verificar schema
  const hasSchema = !!(request as any).routeOptions?.schema;
  checker.checkSchemaValidation(hasSchema);

  // Verificar rate limit
  const hasRateLimit = !!(request as any).routeOptions?.config?.rateLimit;
  checker.checkRateLimiting(hasRateLimit);

  const result = checker.getResult();

  if (!result.passed) {
    console.warn("[SECURITY COMPLIANCE]", {
      route: request.url,
      issues: result.issues,
      warnings: result.warnings,
    });
  }
}

/**
 * Decorator: Marcar rota como segura
 */
export function SecureRoute(options: {
  permission: string;
  auditAction: string;
  requireCSRF?: boolean;
}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [request, reply] = args;

      // 1. Verificar autenticação
      if (!request.user) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // 2. Verificar permissão
      const hasPermission = await checkPermission(request.user.userId, options.permission);

      if (!hasPermission) {
        return reply.status(403).send({
          error: "Forbidden",
          message: "Insufficient permissions",
        });
      }

      // 3. Verificar CSRF se necessário
      if (options.requireCSRF) {
        if (!validateCSRFToken(request, reply)) {
          return;
        }
      }

      // 4. Executar método original
      const result = await originalMethod.apply(this, args);

      // 5. Registrar auditoria
      await auditLog({
        userId: request.user.userId,
        orgId: request.user.orgId,
        action: options.auditAction,
        resource: propertyKey,
        metadata: {
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      return result;
    };

    return descriptor;
  };
}
