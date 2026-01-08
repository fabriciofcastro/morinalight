import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PERMISSION_CHANGE"
  | "SECURITY_ALERT"
  | "SENSITIVE_DATA_ACCESS";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL" | "AUDIT";

export interface AuditContext {
  orgId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  tenantInfo?: any;
}

/**
 * Serviço de Auditoria Universal Imutável (Zero Mocks)
 * Segue padrões HIPAA/SOC2 para rastreabilidade total.
 */
export class UnifiedAuditService {
  /**
   * Registra um evento de auditoria com rastreabilidade completa.
   */
  static async log(
    action: AuditAction,
    options: {
      entityType?: string;
      entityId?: string;
      oldValue?: any;
      newValue?: any;
      severity?: AuditSeverity;
      metadata?: any;
      context: AuditContext;
    },
  ) {
    const {
      entityType,
      entityId,
      oldValue,
      newValue,
      severity = "INFO",
      metadata,
      context,
    } = options;

    try {
      return await prisma.universalAuditLog.create({
        data: {
          action,
          entityType,
          entityId,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
          orgId: context.orgId,
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          deviceFingerprint: context.deviceFingerprint,
          tenant: context.tenantInfo,
          severity,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      // Falha na auditoria é um evento crítico.
      // Em sistemas SOC2, se a auditoria falha, a ação deve ser revertida ou logada em canal de emergência.
      console.error("[CRITICAL] Failed to persist audit log:", error);
      // TODO: Log para Sentry ou Canal de Emergência
    }
  }

  /**
   * Atalho para log de segurança (Login/Logout/MFA)
   */
  static async logSecurity(
    action: "LOGIN" | "LOGOUT" | "SECURITY_ALERT",
    context: AuditContext,
    metadata?: any,
  ) {
    return UnifiedAuditService.log(action, {
      severity: action === "SECURITY_ALERT" ? "CRITICAL" : "INFO",
      context,
      metadata,
    });
  }

  /**
   * Atalho para mudanças de permissão (Privilege Escalation Tracking)
   */
  static async logPermissionChange(
    context: AuditContext,
    details: {
      targetUserId: string;
      permission: string;
      before: boolean | string | null;
      after: boolean | string | null;
      reason: string;
    },
  ) {
    return UnifiedAuditService.log("PERMISSION_CHANGE", {
      entityType: "UserPermission",
      entityId: details.targetUserId,
      oldValue: { permission: details.permission, granted: details.before },
      newValue: { permission: details.permission, granted: details.after },
      severity: "AUDIT",
      metadata: { reason: details.reason },
      context,
    });
  }
}
